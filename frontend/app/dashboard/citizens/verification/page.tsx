import WorkflowQueue from "@/components/citizens/workflow-queue";

export default function CitizenVerificationPage() {
  return (
    <WorkflowQueue
      title="Document Verification"
      description="Woreda-level document verification and data validation queue."
      stage="document_verification"
      allowedActions={["start", "verify-documents", "woreda-verify", "reject", "flag"]}
    />
  );
}
