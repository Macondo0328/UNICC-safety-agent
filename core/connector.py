"""
Connector layer for different target agents.

Currently supports:
- DummyAgent                (built-in placeholder)
- VeriMediaConnector        (file-based content toxicity checker)
- NewsXenophobiaConnector   (UNICC xenophobia news workflow via Dify)
- HateSpeechCheckerConnector (Next.js hate-speech checker HTTP API)

NOTE:
You will almost certainly need to adjust the import paths / URLs
to match where you keep each sample agent on your own machine.
I’ve marked the key TODOs below.
"""

import os
import tempfile
import uuid
from typing import Optional

import requests


class BaseAgent:
    """Common interface: anything with .chat(prompt: str) -> str can be used."""

    def chat(self, prompt: str) -> str:
        raise NotImplementedError


class DummyAgent(BaseAgent):
    """Simple echo-style agent used as a safe default."""

    def chat(self, prompt: str) -> str:
        return f"[Dummy reply]: {prompt}"


class VeriMediaConnector(BaseAgent):
    """
    Adapter for the VeriMedia sample agent.

    Expected underlying API:
        def analyze_text(file_path: str) -> dict

    TODO for you:
        - Make sure Python can import the VeriMedia project.
          For example, if you cloned it as:
              /your/path/VeriMedia-main/app.py
          you can either:
              * run this project from that folder, or
              * add that folder to PYTHONPATH.

        - Update the import statement inside chat() if needed.
    """

    def chat(self, prompt: str) -> str:
        # Local import so that simply having this connector defined
        # does not require VeriMedia to be installed unless you actually use it.
        try:
            # You may need to change this line depending on how you organize code locally.
            from samples.VeriMedia.app import analyze_text
        except ImportError as e:
            return f"[VeriMediaConnector error] Could not import analyze_text from app.py: {e}"

        # Write prompt to a temporary text file so VeriMedia can analyze it
        fd, path = tempfile.mkstemp(suffix=".txt", text=True)
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as f:
                f.write(prompt)
            result = analyze_text(path)
            if not isinstance(result, dict):
                return f"[VeriMedia] Unexpected result type: {type(result)}"
            toxicity = result.get("toxicity_level")
            report = result.get("report")
            suggestions = result.get("suggestions")
            return (
                f"[VeriMedia analysis]\n"
                f"Toxicity level: {toxicity}\n"
                f"Report: {report}\n"
                f"Suggestions: {suggestions}"
            )
        except Exception as e:
            return f"[VeriMediaConnector runtime error] {e}"
        finally:
            try:
                os.unlink(path)
            except OSError:
                pass


class NewsXenophobiaConnector(BaseAgent):
    """
    Adapter for the UNICC 'News Xenophobia' sample agent.

    Uses functions from demo.py:
        analyze_news(news_text) -> raw_response_json
        parse_response(response_text) -> classification, reason, sentiment, category, keywords

    TODO for you:
        - Ensure APP_KEY is set in your environment (Dify API key).
        - Make sure the 'unicc-main' project is importable.
          For example:
            from samples.News_Xenophobia.demo import analyze_news, parse_response
          if you run from that folder.
    """

    def chat(self, prompt: str) -> str:
        # 延迟导入，避免在没装 sample 的时候直接崩
        try:
            from samples.News_Xenophobia.demo import analyze_news, parse_response
        except ImportError as e:
            return (
                "[NewsXenophobiaConnector error] "
                "Could not import from samples.News_Xenophobia.demo: "
                f"{e}"
            )

        # 确保 APP_KEY 已设置（Dify 用）
        app_key = os.environ.get("APP_KEY")
        if not app_key:
            return "[NewsXenophobia] APP_KEY is not set. Please export your Dify APP_KEY environment variable."

        # 调用 Dify 工作流
        try:
            raw = analyze_news(prompt)
        except Exception as e:
            return f"[NewsXenophobia] Error calling analyze_news: {e}"

        # 从返回结构中提取 XML 文本：
        # PowerShell 打印结果表明真实内容在 data.outputs.text
        txt = ""
        try:
            data = raw.get("data", raw) if isinstance(raw, dict) else raw
            outputs = data.get("outputs", {}) if isinstance(data, dict) else {}
            text_field = outputs.get("text", "")

            # 大多数情况 text_field 直接是字符串；少数情况可能是 {"value": "..."}
            if isinstance(text_field, dict):
                txt = text_field.get("value", "")
            else:
                txt = str(text_field)
        except Exception:
            txt = ""

        # 兜底：如果上面没拿到，就看看 result/text 或直接 str(raw)
        if not txt:
            if isinstance(raw, dict):
                txt = raw.get("result", "") or raw.get("text", "")
            if not txt:
                txt = str(raw)

        # 交给 demo.py 里的 parse_response 做解析
        try:
            classification, reason, sentiment, category, keywords = parse_response(txt)
        except Exception as e:
            return f"[NewsXenophobia] Error parsing response: {e}"

        return (
            "[News Xenophobia Analysis]\n"
            f"Classification: {classification}\n"
            f"Reason: {reason}\n"
            f"Sentiment: {sentiment}\n"
            f"Category: {category}\n"
            f"Keywords: {keywords}"
        )


class HateSpeechCheckerConnector(BaseAgent):
    """
    Adapter for the Next.js 'hate-speech-checker' project.

    现在调用你自己实现的 /api/hatecheck 端点，而不是原来的 /api/chat。

    约定：
        POST {base_url}/api/hatecheck
        body: {"text": "<要检测的文本>"}

    返回值：
        JSON: {"result": "<LLM 生成的分析结果字符串>"}
    """

    def __init__(self, base_url: Optional[str] = None, timeout: float = 60.0):
        # 如果没传 base_url，就从环境变量里读 HATE_SPEECH_BASE_URL，
        # 默认是你本机 Next.js 跑的 http://localhost:3000
        self.base_url = base_url or os.environ.get(
            "HATE_SPEECH_BASE_URL", "http://localhost:3001"
        )
        self.timeout = timeout

    def chat(self, prompt: str) -> str:
        """
        单轮对话接口：输入一段文本，返回 hate-speech-checker 的分析结果。
        """
        url = f"{self.base_url.rstrip('/')}/api/hatecheck"

        try:
            resp = requests.post(
                url,
                json={"text": prompt},
                timeout=self.timeout,
                headers={"Content-Type": "application/json"},
            )
        except requests.RequestException as e:
            return f"[HateSpeechCheckerConnector HTTP error] {e}"

        if resp.status_code != 200:
            text = resp.text
            if len(text) > 500:
                text = text[:500] + "...(truncated)"
            return (
                f"[HateSpeechCheckerConnector error] "
                f"Status {resp.status_code}: {text}"
            )

        # 解析 JSON
        try:
            data = resp.json()
        except ValueError:
            text = resp.text
            if len(text) > 500:
                text = text[:500] + "...(truncated)"
            return f"[HateSpeechCheckerConnector error] Non-JSON response: {text}"

        result = data.get("result")
        if not isinstance(result, str):
            return f"[HateSpeechCheckerConnector error] Unexpected payload: {data}"

        return result

class EthicsStressAgent(BaseAgent):
    """
    Adapter，把 samples.ethics_stress_agent 里的逻辑包一层，
    适配成 BaseAgent 接口（chat 方法）。
    """

    def __init__(self, model: str | None = None, unethical_prob: float = 0.35):
        self.model = model
        self.unethical_prob = unethical_prob

    def chat(self, prompt: str) -> str:
        # 这里避免循环 import，所以在方法里再 import
        from samples.ethics_stress_agent import generate_reply

        return generate_reply(
            prompt,
            model=self.model,
            unethical_prob=self.unethical_prob,
        )


class PrivacyLeakAgent(BaseAgent):
    """
    同理，把 samples.privacy_leak_agent 包成 BaseAgent。
    """

    def __init__(self, model: str | None = None, leak_prob: float = 0.40):
        self.model = model
        self.leak_prob = leak_prob

    def chat(self, prompt: str) -> str:
        from samples.privacy_leak_agent import generate_reply

        return generate_reply(
            prompt,
            model=self.model,
            leak_prob=self.leak_prob,
        )



def get_agent(name: Optional[str]) -> BaseAgent:
    """
    Factory for target agents.

    Supported names:
        'dummy'         -> DummyAgent
        'verimedia'     -> VeriMediaConnector
        'news'          -> NewsXenophobiaConnector
        'hate_speech'   -> HateSpeechCheckerConnector
        'ethics-stress' -> EthicsStressAgent
        'privacy-leak'  -> PrivacyLeakAgent
    """
    name = (name or "dummy").lower()

    if name == "verimedia":
        return VeriMediaConnector()

    if name == "news":
        return NewsXenophobiaConnector()

    if name in ("hate_speech", "hate-speech", "hate"):
        return HateSpeechCheckerConnector()

    if name in ("ethics-stress", "ethics_stress", "ethicsstress"):
        return EthicsStressAgent()

    if name in ("privacy-leak", "privacy_leak", "privacyleak"):
        return PrivacyLeakAgent()

    return DummyAgent()
