import { NextResponse } from "next/server";
import type { AutomationAction } from "@/types/workflow";

const automations: AutomationAction[] = [
  { id: "send_email", label: "Send Email", params: ["to", "subject", "body"] },
  { id: "generate_doc", label: "Generate Document", params: ["template", "recipient"] },
  {
    id: "create_calendar_event",
    label: "Create Calendar Event",
    params: ["title", "date", "attendees"],
  },
  {
    id: "update_hr_system",
    label: "Update HR System",
    params: ["employee_id", "field", "value"],
  },
  {
    id: "send_slack_notification",
    label: "Send Slack Notification",
    params: ["channel", "message"],
  },
];

export async function GET() {
  return NextResponse.json(automations);
}

