
 
  export function transformXY(points,divsor){
     if(points.x) return [points.x/divsor,points.y/divsor];
     let pts=[];
     points.forEach(element => {
           if(Array.isArray(element)){
               let pt=[];
               element.forEach(ele => {
                   pt.push([ele.x/divsor,ele.y/divsor]);
               });
               pts.push(pt);
           }else{
               pts.push([element.x/divsor,element.y/divsor]);
           }
     });
     return pts;
 }


 export function render(geometry,ctx){
       if(geometry.type==1){
           renderPoint(geometry,ctx);
       }
       if(geometry.type==2){
           renderLine(geometry.xy,ctx);
       }
       if(geometry.type==3){
           renderPolygon(geometry.xy,ctx);
       }
 }

 export function renderPoint(geometry,ctx){
     let img=geometry.img;
     let xy=geometry.xy[0][0];
     let x=xy[0],y=xy[1];
     if(img){
         let width=img.width,height=img.height;
         ctx.drawImage(img,x-width/2,y-height/2,width,height);
         ctx.restore();
     }
     let properties=geometry.properties||{};
     let name=properties.name;
     if(name){
        //  ctx.save();
        //  ctx.fillStyle='red';
         let textLen=ctx.measureText(name).width;
         ctx.fillText(name,x-textLen/2,y);
         ctx.restore();
     }

 }


 export function renderLine(points,ctx){
     let lines=[];
     if(points.length>1){
         points.forEach(element => {
            lines.push(element);
         });
     }else{
        lines.push(points);
     }
     lines.forEach(element => {
         ctx.save();
         ctx.beginPath();
         for(let i=0;i<element.length;i++){
             let x=element[i][0],y=element[i][1];
             if(i==0) ctx.moveTo(x,y);
             else ctx.lineTo(x,y);
         }
       
         ctx.stroke();
         ctx.restore();

     });
 }

 export function renderPolygon(points,ctx){
     let rings=points;
     var oneRing=rings[0];
     ctx.save();
     ctx.beginPath();
     for(let i=0;i<oneRing.length;i++){
        let x=oneRing[i][0],y=oneRing[i][1];
        if(i==0) ctx.moveTo(x,y);
        else ctx.lineTo(x,y);
     }
     ctx.closePath();
     if(rings.length==1){
        ctx.fill();
        ctx.stroke();
     }else{
         for(let i=1;i<rings.length;i++){
             let ring=rings[i];
             for(let j=0;j<ring.length;j++){
                let x=ring[j][0],y=ring[j][1];
                if(j==0) ctx.moveTo(x,y);
                else ctx.lineTo(x,y);
             }
             ctx.closePath();
         }
         ctx.fill('evenodd');
         ctx.stroke();
     }
     ctx.restore();

 }