const Pbf = require('pbf');
const VectorTile = require('vector-tile').VectorTile;
const URLUTIL = require('url');
const canvasRender=require("./canvasRender")

var layerKers={};
   
  //  const URL='https://tile.nextzen.org/tilezen/vector/v1/256/all/{z}/{x}/{y}.mvt?api_key=YV94UusXQuSJatHeSje4Ag';
  //  const URL='https://free-1.tilehosting.com/data/v3/{z}/{x}/{y}.pbf.pict?key=UmmATPUongHdDmIicgs7';
    const URL='https://b.tiles.mapbox.com/v4/mapbox.mapbox-terrain-v2,mapbox.mapbox-streets-v7/{z}/{x}/{y}.vector.pbf?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA'
    var baseLayer = new maptalks.TileLayer('base',{
        urlTemplate: 'http://a.tiles.mapbox.com/v4/mapbox.light/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejh2N21nMzAxMmQzMnA5emRyN2lucW0ifQ.jSE-g2vsn48Ry928pqylcg',
        subdomains: ['a','b','c'],
        attribution: '&copy; <a href="http://www.osm.org" target="_blank">OpenStreetMap</a> contributors'
    });

      //generate tile url
    baseLayer.getTileUrl = function (x, y, z) {
        return maptalks.TileLayer.prototype.getTileUrl.call(this, x, y, z)+`&x=${x}&y=${y}&z=${z}`
    }
                    

    baseLayer.on('renderercreate', function (e) {
        e.renderer.loadTileImage = function (img, url) {
            var remoteImage = new Image();
            remoteImage.crossOrigin = 'anonymous';
            remoteImage.onload = function () {
        
            var pararmObj = URLUTIL.parse(url, true).query;
            var x=pararmObj.x,y=pararmObj.y,z=pararmObj.z;
            const pbfurl=URL.replace('{x}',x).replace('{y}',y).replace('{z}',z);
            fetch(pbfurl, { mode: 'cors'}).then(response => response.arrayBuffer()) .then(buffer => {
                          let pbf = new Pbf(buffer);
                          let vectorLayer= new VectorTile(pbf);
                          let layers=vectorLayer.layers;
                          let features=[];
                          for(var key in layers){
                              if(key==='boundaries'||key==='earth') continue;
                              layerKers[key]=key;
                              let layer=layers[key];
                              let featureLength=layer.length;
                              for(let i=0;i<featureLength;i++){
                                let feature=layer.feature(i);
                                feature.geojson=feature.loadGeometry();
                                feature.xy=canvasRender.transformXY(feature.geojson,feature.extent/256);
                                feature.layer=key;
                                features.push(feature);
                                //  if(feature.type==3 && feature.geojson.length>1) console.log(feature);
                              }
                          }
                          var base64 = getBase64Image(remoteImage,features);
                          img.src = base64;
                          // console.log(layerKers);
                          // console.log('===================')
              })
          };
          remoteImage.src = url;
        };
    });

    function getBase64Image(img,geometrys) {
        var canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.cssText=`width:${img.width}px;height:${img.height}px`;
        var ctx = canvas.getContext('2d');
        ctx.fillStyle='#E6E4E0';
        ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.restore();
        const keys={
          'building':1,
          'road':1,
          'water':1,
          // 'waterway':1,
          'landuse':1,
          'airport_label':1,
        }
        // ctx.drawImage(img, 0, 0);
        // ctx.fillText('hello',100,100);
        geometrys.forEach(element=>{
          let layer=element.layer;
          if(keys[layer]){
              if(layer=='water'){
                ctx.strokeStyle=ctx.fillStyle='#75CFF0';
              }
              if(layer==='building'){
                ctx.strokeStyle=ctx.fillStyle='gray';
              }
              if(layer==='landuse'){
                ctx.fillStyle=ctx.strokeStyle='#B6E59E';
              }
              if(layer==='waterway'){
                ctx.strokeStyle='red';
                ctx.lineWidth=3;
              }
              if(layer==='airport_label'){
                let img=new Image();
                img.src='assets/icons/airport-15.svg';
                img.width=img.height=40;
                element.img=img;
                ctx.fillStyle='red';
              }
              if(layer==='road'){
                ctx.strokeStyle='#FFA45C';
                ctx.lineWidth=2;
              }
              canvasRender.render(element,ctx);
          }
        })
        ctx.restore();
        var dataURL = canvas.toDataURL('image/png');
        return dataURL;
    }

    var map = new maptalks.Map('map', {
      center: [120.34, 31.309622415877158],
        zoom:  11,
        baseLayer : baseLayer
    });
    map.on('zoomend',function(e){
      vectorLayer.clear();
    })

    var vectorLayer=new maptalks.VectorLayer('vector');
    map.addLayer(vectorLayer);