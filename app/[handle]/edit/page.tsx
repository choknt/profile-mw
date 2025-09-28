import EditForm from "@/components/EditForm";
export default function EditPage({ params }:{ params:{ handle:string } }){ return <EditForm handle={params.handle}/>; }
