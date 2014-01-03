//设置选择视域分析点时的 Action
SuperMap.IS.CalculateViewShedAction = function(layerName, onlyPoint, onComplete, onError, onStart, userContext) 
{
    //定义地图操作对象类型
    this.type = "SuperMap.IS.CalculateViewShedAction";
    
    var keyPoints = new Array();
    var _onlyPoint = onlyPoint;
    var _layerName = layerName;
    var _self = this;
    var count=0;
    
    //设置初始化时的 Action
    this.Init = function(mapControl) 
    {
        this.mapControl = mapControl;
        if (_ygPos.browser == "ie") 
        { 
            mapControl.container.style.cursor = _scriptLocation + "../images/cur_PointQuery.cur"; 
        }
        else
        {
            mapControl.container.style.cursor = "crosshair";
        };
    };

    //单击鼠标时的 Action
    this.OnClick = function(e) 
    {
        if(onlyPoint)
        {
            keyPoints = new Array();
            keyPoints.push(e.mapCoord);
            MapControl2.CustomLayer.ClearEllipses();
            onComplete(keyPoints, _layerName, userContext);
        }
        else
        {
            keyPoints.push(e.mapCoord);
        }
        
        var pe = new SuperMap.IS.CalculateViewShedEventArgs();
        pe.clientActionArgs = new SuperMap.IS.ActionEventArgs();
        pe.clientActionArgs.mapCoords = e.mapCoord;
        if (onStart)
        {
            onStart(pe, userContext);
        }

       //添加自定义点几何对象
        MapControl2.CustomLayer.AddEllipse("center"+count,e.mapCoord,6,6,1,"red","red",0.5,1,"");
        count++;
    };


    //获取该对象的JSON字符串
    this.GetJSON = function() { return _ActionToJSON(this.type, []); }

    this.Destroy = function(){}
    
    //地图鼠标平移事件
    this.OnMouseMove = function(e) {};
    
    //地图鼠标双击事件
    this.OnDblClick = function(e) {};
    
    //地图鼠标左键按下事件
    this.OnMouseDown = function(e) {};
    
    //地图鼠标左键抬起事件
    this.OnMouseUp = function(e) {};
    
    //地图鼠标右键单击事件
    this.OnContextMenu = function(e) {};
    
 };

//设置释放对象时的 Action
this.Destroy = function() 
{  
    this.mapControl = null;
    while (keyPoints.length > 0)
    {
        keyPoints.pop();
    }
};

SuperMap.IS.CalculateViewShedEventArgs = function()
{
    this.clientActionArgs = null;
    this.cancel = false;
    this.FromJSON = function(o)
    {
        if (!o) { return; }
        if (o.clientActionArgs)
        {
            this.clientActionArgs = new SuperMap.IS.ActionEventArgs();
            this.clientActionArgs.FromJSON(o.clientActionArgs);
        }
        this.cancel = o.cancel;
    };

    this.Destroy = function()
    {
        if (this.clientActionArgs)
        {
            this.clientActionArgs.Destroy();
        }
    };
};


function OnActionError(){}
function OnActionStart(){}
 
