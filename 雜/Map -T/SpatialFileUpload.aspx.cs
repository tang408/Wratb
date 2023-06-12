using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.IO;
using System.Diagnostics;

public partial class Map_SpatialFileUpload : System.Web.UI.Page
{
  //  private static readonly log4net.ILog log = log4net.LogManager.GetLogger(typeof(Map_SpatialFileUpload));
    String tmpFilePath = null;
    String targetDirName = null;
    protected void Page_Load(object sender, EventArgs e)
    {
        tmpFilePath = Server.MapPath("~/temp");
        if (Request.Files.Count == 0) return;
        if (!Directory.Exists(tmpFilePath))
        {
            Directory.CreateDirectory(tmpFilePath);
        }

        var hpFile = Request.Files[0];
        var ext = Path.GetExtension(hpFile.FileName).ToLower();
        string targetFolder = null;
        var textFileUrl = new Uri(Request.Url, Request.ApplicationPath + (Request.ApplicationPath.EndsWith("/") ? "" :"/"));
        String targetFileName;

        if (ext == ".zip")
        {
            targetDirName = Guid.NewGuid().ToString();
            // 解壓縮檔案
            targetFolder = unzipFile(hpFile);

            // 找到shp所在的目錄
            targetFolder = findDirectory(targetFolder, "*.shp");
            if (targetFolder == null) return;

            string targetFile = Directory.GetFiles(targetFolder, "*.shp")[0];
            targetFileName = Guid.NewGuid().ToString() + ".kml";
            string kmlFilePath = Path.Combine(tmpFilePath, targetDirName, targetFileName);

            if (shp2KML(targetFile, kmlFilePath) == 0)
            {
                var kmlUrl = new Uri(textFileUrl, "temp/" + targetDirName + "/") + targetFileName;
                ScriptManager.RegisterStartupScript(this, this.GetType(), "", "parent.addShp('" + kmlUrl + "');", true);
            }
        }
        else if(ext == ".kml")
        {
            targetFileName = Guid.NewGuid().ToString() + ".kml";
            hpFile.SaveAs(Path.Combine(tmpFilePath, targetFileName));
            var kmlUrl = new Uri(textFileUrl, "temp/") + targetFileName;
            ScriptManager.RegisterStartupScript(this, this.GetType(), "", "parent.addKML('" + kmlUrl + "');", true);
        }
    }

    private string unzipFile(HttpPostedFile hpFile)
    {
        string fileName = Guid.NewGuid().ToString() + ".zip";
        string filePath = Path.Combine(tmpFilePath, fileName);
        string unZipFolder = Path.Combine(tmpFilePath, targetDirName);
        hpFile.SaveAs(filePath);
        var ezZip = new EzZipData();
        ezZip.UnZipFile(filePath, unZipFolder);
        File.Delete(filePath);
        return unZipFolder;
    }

    private string findDirectory(string dirPath, string filePattern)
    {
        if (Directory.GetFiles(dirPath, filePattern).Length > 0)
        {
            return dirPath;
        }
        var subDirs = Directory.GetDirectories(dirPath);
        for (var i = 0; i < subDirs.Length; i++)
        {
            string ret = findDirectory(subDirs[i], filePattern);
            if (ret != null) return ret;
        }
        return null;
    }

    private int shp2KML(string filePath, String kmlFilePath)
    {

        // Use ProcessStartInfo class
        ProcessStartInfo startInfo = new ProcessStartInfo();
        startInfo.CreateNoWindow = false;
        startInfo.UseShellExecute = false;
        startInfo.RedirectStandardError = true;
        startInfo.RedirectStandardOutput = true;
        startInfo.WindowStyle = ProcessWindowStyle.Hidden;

        try
        {
            // ogr2ogr不支援中文檔名, 需先將檔名轉成純英數的檔名
            string targetFileNameWE = Guid.NewGuid().ToString();
            String targetFolder = Path.GetDirectoryName(filePath);
            var files = Directory.GetFiles(targetFolder, Path.GetFileNameWithoutExtension(filePath) + ".*");
            foreach (var fileName in files)
            {
                File.Copy(fileName, Path.Combine(targetFolder, targetFileNameWE + Path.GetExtension(fileName)));
            }

            string targetFilePath = Path.Combine(targetFolder, targetFileNameWE + ".shp");
            startInfo.WorkingDirectory = Server.MapPath("~");
            startInfo.FileName = Server.MapPath("~/Map/ogr2ogr.bat");
            startInfo.Arguments = "-skipfailures -f KML -s_srs \"" + hfCRS.Value + "\" -t_srs \"EPSG:4326\" \"" + kmlFilePath + "\" \"" + targetFilePath + "\" > log\\ogr2ogr.log";
            //log.Info(startInfo.WorkingDirectory);
            //log.Info(startInfo.FileName + " " + startInfo.Arguments + "");
            using (Process exeProcess = new Process())
            {
                exeProcess.StartInfo = startInfo;
                exeProcess.ErrorDataReceived += new DataReceivedEventHandler(writeErrorLog);
                exeProcess.OutputDataReceived += new DataReceivedEventHandler(writeErrorLog);
                exeProcess.Start();
                exeProcess.BeginErrorReadLine();
                exeProcess.WaitForExit();
                //log.Info("ogr2ogr process exitCode = " + exeProcess.ExitCode);
                return exeProcess.ExitCode;
            }
        }
        catch (Exception e)
        {
            //log.Error("A Exception Happened!!", e);
            return -1;
        }
    }

    private static void writeErrorLog(Object target, DataReceivedEventArgs args)
    {
        //log.Error(args.Data);
    }
}