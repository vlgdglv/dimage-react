//重新定义img的宽和高
//参数：orginalImage<目标图片的DOM元素>、newWidth<图片元素的容器宽度>、newHeight<图片元素的容器高度>
export function reSizeImage(orginalImage, newWidth, newHeight){
   
  let image = new Image();
  image= orginalImage
  // console.log(image)
  console.log(image.width)
  if(image.width > 0 && image.height > 0){
  //判断图片的纵横比
      if(image.width/image.height >= newWidth/newHeight){
          //当源图的宽度大于重定义尺寸的宽度时，应压缩高度
          if(image.width > newWidth){
              orginalImage.width = newWidth;
              orginalImage.height = (image.height*newWidth)/image.width;
          }else{
               //当宽度小于或等于重定义宽度时，图片完全显示
              orginalImage.width =image.width ;
              orginalImage.height = image.height;
          }
      }else{
          //同理
          if(image.height > newHeight){
              orginalImage.height = newHeight;
              orginalImage.width = (image.width*newHeight)/image.height;
          }else{
              orginalImage.width = image.width;
              orginalImage.height = image.height;
          }
          
      } 
  }    
}