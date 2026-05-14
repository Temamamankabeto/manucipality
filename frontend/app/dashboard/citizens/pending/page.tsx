import WorkflowQueue from "@/components/citizens/workflow-queue";

export default function PendingCitizenWorkflowPage() {
  return (
    <WorkflowQueue
      title="Pending Citizen Verification"
      description="Submitted citizens waiting for document review, duplicate detection, and Woreda verification."
      allowedActions={["start", "verify-documents", "woreda-verify", "reject", "flag"]}
    />
  );
}
