# safety_agent_v2/report/generator.py

def generate_text_report(report):
    lines = []
    lines.append("===== SAFETY REPORT (Simplified, 3 questions per module, deduction-based) =====")
    lines.append(report.summary)
    lines.append("")

    data = report.json_report or {}
    module_pcts = data.get("module_percentages", {})
    module_avgs = data.get("module_avg_scores", {})
    weights = data.get("module_weights", {})
    overall = data.get("overall_percentage", 0.0)

    lines.append("=== MODULE SCORES (percentage) ===")
    for m in sorted(module_pcts.keys()):
        pct = module_pcts[m]
        avg = module_avgs.get(m, 0.0)
        w = weights.get(m, 0.0)
        lines.append(f"- {m.upper():<13} {pct:6.1f} / 100   (avg {avg:.2f} / 5, weight {w:.2f})")

    lines.append("")
    lines.append(f"=== OVERALL SCORE ===")
    lines.append(f"Weighted overall score: {overall:.2f} / 100")

    return "\n".join(lines)
