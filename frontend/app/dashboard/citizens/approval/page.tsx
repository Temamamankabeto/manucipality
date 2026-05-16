import WorkflowQueue from "@/components/citizens/workflow-queue";
export default function Page(){return <WorkflowQueue title="Citizen Approval" description="Subcity approval, City ID generation, and profile activation." allowedActions={["subcity-approve","generate-id","activate","reject"]}/>}
