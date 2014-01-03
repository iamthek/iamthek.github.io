<%@ WebHandler Language="C#" Class="WMSLayerHandler" %>

using System;
using System.Web;
using System.Text;
using System.Drawing;
using System.Net;
using SuperMap.IS.Utility;

public class WMSLayerHandler : IHttpHandler {
    
    public void ProcessRequest (HttpContext context) {
        if (context.Request["tileBoundInfo"]==null)
        {
            return;
        }
        //tileBoundInfo=lb.x ,lb.y , rt.x , rt.y ,tx , ty ,level;
        string[] infoStrs = context.Request["tileBoundInfo"].Split(new char[] { ',' });
        
        MapCoord leftBottom = new MapCoord(double.Parse(infoStrs[0]), double.Parse(infoStrs[1]));
        MapCoord rightTop = new MapCoord(double.Parse(infoStrs[2]), double.Parse(infoStrs[3]));
        string bbox = leftBottom.X + "," + leftBottom.Y + "," + rightTop.X + "," + rightTop.Y;
        string level=(int.Parse(infoStrs[6])-1).ToString();
     string  R="&TILEROW="+infoStrs[5];
     string  C="&TILECOL="+infoStrs[4];
     string L = "&TILEMATRIX=" + level;
    StringBuilder wmsUrl = new StringBuilder("http://localhost/IS/WebServices/wmts.ashx?map=World_Day&SERVICE=WMTS&REQUEST=GetTile&LAYER=World_Day&TILEMATRIXSET=GlobalCRS84Scale_World_Day");
        wmsUrl.Append(R);wmsUrl.Append(C);wmsUrl.Append(L);
        wmsUrl.Append("&FORMAT=image/png&STYLE=DefaultStyle&VERSION=1.0.0");
        System.Net.HttpWebRequest request = (HttpWebRequest)System.Net.WebRequest.Create(wmsUrl.ToString());
        request.Timeout = 150000;
        WebResponse response = request.GetResponse();
        Bitmap bitmap = new Bitmap(response.GetResponseStream());
        bitmap.MakeTransparent(Color.White);
        string tileFilesPath = "D:\\SuperMapSoftWare\\SuperMap IS .NET 6\\output\\";
        int random = new Random().Next(1, 100000);
        DateTime datatime = new DateTime();
        string tileFilesName = "WmtsLayer_" + infoStrs[4] + "_" + infoStrs[5] + "_" + infoStrs[6] + (Int32)random + datatime.Millisecond + ".png";
        string outputLocation = "http://localhost/IS/Output/";
        
        try
        {
            bitmap.Save(tileFilesPath + tileFilesName, System.Drawing.Imaging.ImageFormat.Png);
            context.Response.Redirect(outputLocation + tileFilesName, false);
      
            context.Response.StatusCode = 301;
            context.Response.StatusDescription = "Moved Permanently";
            context.Response.End();
        }
        catch(Exception exp)
        {
            System.Console.WriteLine(exp.Message);
        }
    }
 
    public bool IsReusable {
        get {
            return false;
        }
    }

}