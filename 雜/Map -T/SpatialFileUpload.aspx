<%@ Page Language="C#" AutoEventWireup="true" CodeFile="SpatialFileUpload.aspx.cs" Inherits="Map_SpatialFileUpload" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
</head>
<body scroll="no" style="margin:0px; padding:0px">
    <form id="form1" runat="server">
    <div>
        <asp:FileUpload ID="fuFile" runat="server" Width="100%" />
        <asp:HiddenField ID="hfCRS" Value="EPSG:3826" runat="server" />
        <asp:Button ID="btnUpload" runat="server" style="display:none" />
    </div>
    </form>
</body>
</html>
