import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { Download, Upload, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { downloadBackup, importFromFile } from "@/db/backup";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Backup() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [importing, setImporting] = useState(false);

  const handleExport = () => {
    try {
      downloadBackup();
      toast.success("备份文件已开始下载");
    } catch {
      toast.error("导出失败");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
  };

  const handleImportClick = () => {
    if (!selectedFile) {
      toast.error("请先选择备份文件");
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirmImport = async () => {
    if (!selectedFile) return;
    setImporting(true);
    try {
      await importFromFile(selectedFile);
      toast.success("数据导入成功");
      setSelectedFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch {
      toast.error("导入失败，请检查文件格式");
    } finally {
      setImporting(false);
      setConfirmOpen(false);
    }
  };

  return (
    <div className="pb-24">
      <PageHeader title="备份管理" onBack={() => navigate("/profile")} />

      <div className="px-4 space-y-4">
        {/* Export */}
        <Card className="rounded-xl">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-green-500" />
              <h3 className="font-semibold text-sm">导出备份</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              将所有数据导出为 JSON 文件，可用于恢复或迁移数据。建议定期备份。
            </p>
            <Button onClick={handleExport} className="w-full rounded-full gap-2">
              <Download className="h-4 w-4" />
              导出备份
            </Button>
          </CardContent>
        </Card>

        {/* Import */}
        <Card className="rounded-xl">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold text-sm">导入数据</h3>
            </div>
            <div className="flex items-start gap-2 p-2.5 bg-amber-50 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                导入将覆盖所有现有数据，请确保已备份当前数据。
              </p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="block w-full text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80"
            />
            {selectedFile && (
              <p className="text-xs text-muted-foreground">
                已选择: {selectedFile.name}
              </p>
            )}
            <Button
              variant="outline"
              onClick={handleImportClick}
              disabled={!selectedFile || importing}
              className="w-full rounded-full gap-2"
            >
              <Upload className="h-4 w-4" />
              {importing ? "导入中..." : "导入数据"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认导入</AlertDialogTitle>
            <AlertDialogDescription>
              导入将会覆盖所有现有数据，此操作不可撤销。确定要继续吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={importing}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmImport} disabled={importing}>
              {importing ? "导入中..." : "确认导入"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
