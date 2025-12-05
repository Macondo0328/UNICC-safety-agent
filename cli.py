import sys
import json

from core.orchestrator import SafetyOrchestrator
from report.generator import generate_text_report


def main():
    agent_name = sys.argv[1] if len(sys.argv) > 1 else None
    orch = SafetyOrchestrator(agent_name=agent_name)
    report = orch.run_full()

    # 1) 打印概要报告
    print(generate_text_report(report))

    # 2) 保存精简版（只有scores和overall）——你现在已经有的
    with open("report.json", "w", encoding="utf-8") as f:
        json.dump(report.json_report, f, indent=2, ensure_ascii=False)

    # 3) 保存完整版（包含每个module、每道task、每一轮对话）
    #   用 pydantic 的 .dict() 导出全部字段
    with open("report_full.json", "w", encoding="utf-8") as f:
        json.dump(report.dict(), f, indent=2, ensure_ascii=False)

    print("\nSaved summary JSON to report.json")
    print("Saved full JSON (with dialogues) to report_full.json")


if __name__ == "__main__":
    main()
