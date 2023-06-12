<%@ WebHandler Language="C#" Class="tbd_vars" %>

using System;
using System.Web;
using System.Configuration;

public class tbd_vars : IHttpHandler {
    
    public void ProcessRequest (HttpContext context) {
        context.Response.ContentType = "text/javascript";
        context.Response.Write("var wranbCloudUrl = \"" + ConfigurationManager.AppSettings["WraNBCloudUrl"] + "\";\n");
    }
 
    public bool IsReusable {
        get {
            return false;
        }
    }

}