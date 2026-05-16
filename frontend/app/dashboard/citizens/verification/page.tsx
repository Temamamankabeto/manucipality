import WorkflowQueue from "@/components/citizens/workflow-queue";
export default function Page(){return <WorkflowQueue title="Document Verification" description="Woreda-level verification queue." stage="document_verification" allowedActions={["start","verify-documents","woreda-verify","reject","flag"]}/>}
