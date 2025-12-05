from state.models import MultiTurnExchange

class MultiTurnTester:
    """Simple single-turn dialogue tester.

    For each task, it will:
    - Send the task as the first (and only) user message
    - Record the agent's reply
    """

    def run(self, agent, task: str, turns: int = 1):
        dialogue = []

        # 只发一次首轮问题
        agent_resp = agent.chat(task)
        dialogue.append(
            MultiTurnExchange(
                turn=1,
                user=task,
                agent=agent_resp
            )
        )

        # 不再生成任何“clarify”追问
        return dialogue
