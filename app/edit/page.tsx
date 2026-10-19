import EditGuard from "@/components/EditGuard";
import EditView from "@/components/album/EditView";

export default function EditPage() {
  return (
    <EditGuard>
      <EditView />
    </EditGuard>
  );
}
