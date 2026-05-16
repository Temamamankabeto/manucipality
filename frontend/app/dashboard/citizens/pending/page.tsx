import WorkflowQueue from "@/components/citizens/workflow-queue";
export default function Page(){return <WorkflowQueue title="Pending Citizen Verification" description="Submitted citizens waiting for document review." allowedActions={["start","verify-documents","woreda-verify","reject","flag"]}/>}
