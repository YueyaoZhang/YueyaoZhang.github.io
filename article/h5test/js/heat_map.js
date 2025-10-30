/**
 * Created by wangchaowei on 2018/7/4.
 */

var heatMapDatas = [];
var nowTime = '2008/1';
var nowKind =	'AOX';


// 导入CSV文件，画出当前时间的柱状图
function drawHeatMapFromCSV() {
    var filePath = './csv/test1.csv';

    d3.csv(filePath, function(error, csvdata){
       

        if(error){
            alert("请输入正确的文件目录");
        }

        var indexCSV = 0;
        while (typeof csvdata[indexCSV] != "undefined"){
            var time = csvdata[indexCSV]["sampledate"];
           	var tim=[];
           	tim=time.split('/');
           	time=tim[0]+'/'+tim[1];
            var kind = csvdata[indexCSV]["measure"]		
            var x = csvdata[indexCSV]["X"];
            var y = csvdata[indexCSV]["value"];
            var z = csvdata[indexCSV]["Y"];
            for( var index=0;index < heatMapDatas.length; index += 1){
                if(heatMapDatas[index]["time"] == time&&heatMapDatas[index]["kind"]==kind){
                    heatMapDatas[index]["datas"].push([x, y, z]);
                  
                    break;
                }
            }


            indexCSV += 1;
        }

       
        
        pressButton(nowTime,nowKind);
    });

}


function buttonevent()
{
	pressButton(nowTime,nowKind);

}
function pressButton(time,kind){
    nowTime = time;
    nowKind = kind;
   // buttonActive("button"+time);

    //清空现有的柱状图
    d3.selectAll(".heatMap").remove();
    d3.selectAll(".heatMapLabel").remove();

    //获取当前时间段的数据
    var datas = [];
    for(var index=0; index < heatMapDatas.length; index++){
        if (heatMapDatas[index]["time"] == nowTime&&heatMapDatas[index]["kind"] == nowKind){
            datas = heatMapDatas[index]["datas"];
            break;
        }
    }
   
    //画柱状图
    var maxy=parseFloat(datas[0][1]);
    for(var index=1; index < datas.length; index++)
    {
    	if(parseFloat(datas[index][1])>maxy)
    	{
    		maxy=datas[index][1];
   		}
    }
    console.log(maxy);
    //如何改变坐标值
    for(var index=0; index < datas.length; index++){

        drawHeatMap(datas[index][0], datas[index][1], datas[index][2],maxy*3/12.5);
        
    }
}



//鼠标放到柱形图上显示物质种类需要修改
function showIntensity(parent) {
    var translation = parent.getAttribute('translation');
    var data = translation.split(" ");
    var x = data[0];
    var y = data[1];
    var z = data[2];
    makeMark(x, y, z, y, "red", 1);//需要改正
}

//鼠标移出柱形图时删除物质种类
function removeIntensity(parent) {
    var translation = parent.getAttribute('translation');
    var data = translation.split(" ");
    var x = data[0];
    var z = data[2];
    d3.select("#"+"x"+x+"z"+z+"intensity").remove();
}

function drawHeatMap(x, y, z,mul) {
    if(y==0){
        d3.select("#x"+x+"z"+z+"mark").remove();
    }
    else {
        var scene = d3.select('scene');
        var rect = scene.append("transform")
            .attr("onmouseover", "showIntensity(this);")
            .attr("onmouseout", "removeIntensity(this)")//显示数据相关
            .attr("id", "x"+x+"z"+z+"box")
            .attr("class", "heatMap");

        var heatMap = rect.append("shape");

        heatMap
            .append("appearance")
            .append("material")
            .attr("diffusecolor", coloring(y));
        heatMap
            .append("box");

         //需要改正比例
        rect
            .attr("scale", "0.25 "+ 0 +" 0.25")
            .attr("translation", x + " " + y + " " + z)
            .transition()
            .duration(2000)
            .ease("elastic")
            .attr("scale", "0.25 "+ y/mul +" 0.25")
            .attr("translation", x + " " + y/mul + " " + z);


        // 如果小于300或者大于3000则在柱形图上标记个红叉
        if(y>0.5){
            makeMark(x, y, z, "X");}
    }
}

function makeMark(x, y , z, mark, color, size) {
    var heatMapLabelShape = scene.append("transform")
        .attr("translation", function () {
            return x-0.25 + " " + (y+0.25) + " " + z
        })
        .attr("class", "heatMapLabel")
        .attr("id", mark=="X" ? "x"+x+"z"+z+"mark" : "x"+x+"z"+z+"intensity")
        .append("billboard")
        .attr("axisOfRotation", "0 0 0")
        .append("shape");
    heatMapLabelShape.append("appearance")
        .append("material")
        .attr("diffusecolor", color ? color : "#fb1d13")
    heatMapLabelShape.append("text")
        .attr("class", "heatMapLabelText")
        .attr("solid", "true")
        .attr("string", mark)
        .append("fontstyle")
        .attr("size", size ? size : 0.7)
        .attr("family", "SANS")
        .attr("justify", "END MIDDLE" )

}

function coloring(lux){
    var colors = [
        "#702200", // 0~300 3001~~~
        "#FFD1BD",
        "#FFBFA3",
        "#FFAD8A",
        "#FF9B70",
        "#FF8957",
        "#FF773D",
        "#FF6524",
        "#FF540A",
        "#fd3d2b",
        "#fb220e",
        "#f01400",
        "#c71100",
        "#8A2900",

    ];
    if(lux>0.5){
        return colors[0];
    }
    return colors[parseInt(lux*20.7)];
}

function heatMap3d(parent,maxy) {
    var x3d = parent
        .append("x3d")
        .style( "width", parseInt(parent.style("width"))+"px" )
        .style( "height", parseInt(parent.style("height"))+"px" )
        .style( "border", "none" );

    var scene = x3d.append("scene");
    this.scene = scene;

    scene.append("orthoviewpoint")
        .attr( "centerOfRotation", [5, 5, 5])
        .attr( "fieldOfView", [-5, -5, 15, 15])
        .attr( "orientation", [-0.5, 1, 0.2, 1.12*Math.PI/4])
        .attr( "position", [15, 8, 10]);

    var rows = initializeDataGrid();
    var axisRange = [0, 20];
    var scales = [];
    var initialDuration = 2000;
    var axisKeys = ["x", "y", "z"];

    function initializeDataGrid() {
        var rows = [];
        // Follow the convention where y(x,z) is elevation.
        for (var x=-5; x<=5; x+=1) {
            for (var z=-5; z<=5; z+=1) {
                rows.push({x: x, y: 0, z: z});
            }
        }
        return rows;
    }

    function axisName( name, axisIndex ) {
        return ['x','y','z'][axisIndex] + name;
    }

    function constVecWithAxisValue( otherValue, axisValue, axisIndex ) {
        var result = [otherValue, otherValue, otherValue];
        result[axisIndex] = axisValue;
        return result;
    }

    // Used to make 2d elements visible 设定形状下的样式
    function makeSolid(selection, color) {
        selection.append("appearance")
            .append("material")
            .attr("diffuseColor", color||"black"); //样式颜色默认是黑色
        return selection;
    }

    // Initialize the axes lines and labels.
    function initializePlot(mul) {
        initializeAxis(0,mul);
        initializeAxis(1,mul);
        initializeAxis(2,mul);
    }

    function initializeAxis( axisIndex,mul) {
        var key = axisKeys[axisIndex];
        drawAxis( axisIndex, initialDuration, mul);

        var scaleMin = axisRange[0];
        var scaleMax = axisRange[1];

        // the axis line
        var newAxisLine = scene.append("transform")
            .attr("class", axisName("Axis", axisIndex))
            // .attr("rotation", [0,1,0,-Math.PI/2])
            .attr("rotation", ([[0,0,0,0],[0,0,1,Math.PI/2],[0,1,0,-Math.PI/2]][axisIndex]))
            .append("shape");
        newAxisLine
            .append("appearance")
            .append("material")
            .attr("emissiveColor", "lightgray");
        newAxisLine
            .append("polyline2d")
            .attr("usegeocache", "false")
            .attr("lineSegments", "0 0,10 0");

        var newAxisLabel = scene.append("transform")
            .attr("class", axisName("AxisLabel", axisIndex))
            .attr("translation", constVecWithAxisValue( 0, axisIndex==1 ? 11 : 21, axisIndex ));

        var newAxisLabelShape = newAxisLabel
            .append("billboard")
            .attr("axisOfRotation", "0 0 0")
            .append("shape")
            .call(makeSolid);

        var labelFontSize = 0.6;

        newAxisLabelShape
            .append("text")
            .attr("class", axisName("AxisLabelText", axisIndex))
            .attr("solid", "true")
            .attr("string", key) //"x,y,z"
            .append("fontstyle")  //字体样式
            .attr("size", labelFontSize)
            .attr("family", "SANS")
            .attr("justify", "END MIDDLE" );

    }

    function drawAxis( axisIndex, duration,mul){//增加背景
        var NUMTICKS = 20;
        var scale = d3.scale.linear()
            .domain( axisIndex==1 ? [0,mul] : [0,NUMTICKS] )
            .range( axisIndex==1 ? [0,10] : axisRange );

        scales[axisIndex] = scale;

        var numTicks = NUMTICKS;
        var tickSize = 0.1;
        var tickFontSize = 0.5;

        var ticks = scene.selectAll( "."+axisName("Tick", axisIndex) )
            .data( scale.ticks( axisIndex==1 ? 8 : numTicks ));
        var newTicks = ticks.enter()
            .append("transform")
            .attr("class", axisName("Tick", axisIndex));
        newTicks.append("shape").call(makeSolid)
            .append("box")
            .attr("size", tickSize + " " + tickSize + " " + tickSize);
        //过渡效果
        ticks.transition().duration(duration)
            .attr("translation", function(tick) {
                return constVecWithAxisValue( 0, scale(tick), axisIndex ); });
        ticks.exit().remove();

        var tickLabels = ticks.selectAll("billboard shape text")
            .data(function(d) { return [d]; });
        var newTickLabels = tickLabels.enter()
            .append("billboard")
            .attr("axisOfRotation", "0 0 0")
            .append("shape")
            .call(makeSolid);
        newTickLabels.append("text")
            .attr("string", scale.tickFormat( axisIndex==1 ? 8 : NUMTICKS))
            .attr("solid", "true")
            .append("fontstyle")
            .attr("size", tickFontSize)
            .attr("family", "SANS")
            .attr("justify", "END MIDDLE" );
        tickLabels
            .attr("string", scale.tickFormat(axisIndex==1 ? 8 : NUMTICKS));
        tickLabels.exit().remove();

        if (axisIndex==0 || axisIndex==2) {

            var gridLines = scene.selectAll( "."+axisName("GridLine", axisIndex))
                .data(scale.ticks( numTicks ));
            gridLines.exit().remove();

            var newGridLines = gridLines.enter()
                .append("transform")
                .attr("class", axisName("GridLine", axisIndex))
                .attr("rotation", axisIndex==0 ? [0,1,0, -Math.PI/2] : [0,0,0,0]) //[x,y,z,angle]
                .append("shape");
            newGridLines.append("appearance")
                .append("material")
                .attr("emissiveColor", "gray");
            newGridLines.append("polyline2d"); //绘制的线条

            gridLines.selectAll("shape polyline2d").transition().duration(duration)
                .attr("lineSegments", "0 0, " + axisRange[1] + " 0");

            gridLines.transition().duration(duration)
                .attr("translation", axisIndex==0
                    ? function(d) { return scale(d) + " 0 0"; }
                    : function(d) { return "0 0 " + scale(d); }
                );
        }
        else {

            var gridLines = scene.selectAll( "."+axisName("GridLine", axisIndex))
                .data(scale.ticks( 1 ));
            gridLines.exit().remove();

            for(var yTick=0.05; yTick <= 1; yTick+=0.05){
                // Z，Y面线
                var newGridLines = gridLines.enter()
                    .append("transform")
                    .attr("class", axisName("GridLine", axisIndex))
                    .attr("rotation", [0,0,0,0]) //[x,y,z,angle]
                    .append("shape");
                newGridLines.append("appearance")
                    .append("material")
                    .attr("emissiveColor", "gray");
                newGridLines.append("polyline2d"); //绘制的线条

                gridLines.selectAll("shape polyline2d").transition().duration(duration)
                    .attr("lineSegments", "0 0, " + axisRange[1] + " 0");

                gridLines.transition().duration(duration)
                    .attr("translation", "0 " + yTick/400 + " 0");

                // X，Y面线
                var newGridLines = gridLines.enter()
                    .append("transform")
                    .attr("class", axisName("GridLine", axisIndex))
                    .attr("rotation", [0,1,0,-Math.PI/2]) //[x,y,z,angle]
                    .append("shape");
                newGridLines.append("appearance")
                    .append("material")
                    .attr("emissiveColor", "gray");
                newGridLines.append("polyline2d"); //绘制的线条

                gridLines.selectAll("shape polyline2d").transition().duration(duration)
                    .attr("lineSegments", "0 0, " + axisRange[1] + " 0");

                gridLines.transition().duration(duration)
                    .attr("translation", "0 " + yTick/400 + " 0");
            }

            var newAxisLine = scene.append("transform")
                .attr("class", axisName("Axis", axisIndex))
                .attr("rotation", ([0,0,0,0]))
                .append("shape");
            newAxisLine
                .append("appearance")
                .append("material")
                .attr("emissiveColor", "lightgray");
            newAxisLine
                .append("polyline2d")
                .attr("usegeocache", "false")
                .attr("lineSegments", "20 20, 20 0");

            var newAxisLine = scene.append("transform")
                .attr("class", axisName("Axis", axisIndex))
                .attr("rotation", [0,1,0,-Math.PI/2])
                .append("shape");
            newAxisLine
                .append("appearance")
                .append("material")
                .attr("emissiveColor", "lightgray");
            newAxisLine
                .append("polyline2d")
                .attr("usegeocache", "false")
                .attr("lineSegments", "20 20, 20 0");
        }

    }
    
    function drawButton() {
        var timeRange =[];
        for(var i=1998;i<=2016;i+=1)
        {
        	for(var j=1;j<=12;j+=1)
        	{
        		timeRange.push(i+'/'+j);
        	}
        }

       
        var kindRange = ["measure",
"1,2,3-Trichlorobenzene","1,2,4-Trichlorobenzene","Acenaphthene","Acenaphthylene","AGOC-3A","Alachlor","Aldrin","alpha-Hexachlorocyclohexane","Aluminium",
"Ammonium","Anionic active surfactants","Anthracene","AOX","Arsenic","Atrazine","Barium","Benzo(a)anthracene","Benzo(a)pyrene","Benzo(b)fluoranthene",
"Benzo(g,h,i)perylene","Benzo(k)fluoranthene","Berilium","beta-Hexaxchlorocyclohexane","Bicarbonates","Biochemical Oxygen","Boron","Cadmium",
"Calcium","Carbonates","Cesium","Chemical Oxygen Demand (Cr)","Chemical Oxygen Demand (Mn)","Chlorides","Chlorodinine","Chromium","Chrysene",
"Copper","Cyanides","Dieldrin","Dissolved organic carbon","Dissolved oxygen","Dissolved silicates","Endosulfan (alpha)","Endosulfan (beta)","Endrin",
"Fecal coliforms","Fecal streptococci ","Fluoranthene","Fluorene","gamma-Hexachlorocyclohexane","Heptachlor","Heptachloroepoxide","Hexachlorobenzene",
"Indeno(1,2,3-c,d)pyrene","Inorganic nitrogen","Iron","Isodrin","Lead","Macrozoobenthos","Magnesium","Manganese","Mercury","Methoxychlor",
"Methylosmoline","Metolachlor","Naphthalene","Nickel","Nitrates","Nitrites","Organic nitrogen","Orthophosphate-phosphorus","Oxygen saturation",
"p,p-DDD","p,p-DDE","p,p-DDT","PAHs","PCB 101","PCB 118","PCB 138","PCB 153","PCB 180","PCB 28","PCB 52","Pentachlorobenzene","Petroleum hydrocarbons",
"Phenanthrene","Potassium","Pyrene","Selenium","Silica (SiO2)","Simazine","Sodium","Sulfides","Sulphates","Tetrachloromethane","Total coliforms",
"Total dissolved phosphorus","Total dissolved salts","Total extractable matter","Total hardness","Total nitrogen","Total organic carbon","Total phosphorus",
"Trifluralin","Water temperature","Zinc"];
        initHeatMapDatas(timeRange,kindRange);
    }	

    function initHeatMapDatas(timeRange,kindrange) {
        for(var time=0; time < timeRange.length; time += 1){
        	for(var kind =0;kind<=kindrange.length;kind+=1){
            heatMapDatas.push({"time": timeRange[time],"kind":kindrange[kind],"datas":[]});
        	}
        }
      
    }

    initializePlot(maxy);
    drawButton();
}