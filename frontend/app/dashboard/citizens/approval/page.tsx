import WorkflowQueue from "@/components/citizens/workflow-queue";

export default function CitizenApprovalPage() {
  return (
    <WorkflowQueue
      title="Citizen Approval"
      description="Subcity approval, City ID generation, and profile activation workflow."
      allowedActions={["subcity-approve", "generate-id", "activate", "reject"]}
    />
  );
}
