'use strict';

import Base from './base.js';

export default class extends Base {
  /**
   * index action
   * @return {Promise} []
   */
  //购物车展示
  indexAction(){
    //auto render template file index_index.html
    this.meta_title = "购物车";//标题1
    this.keywords = this.setup.WEB_SITE_KEYWORD ? this.setup.WEB_SITE_KEYWORD : '';//seo关键词
    this.description = this.setup.WEB_SITE_DESCRIPTION ? this.setup.WEB_SITE_DESCRIPTION : "";//seo描述
    return this.display();
  }
  //添加购物车
  async addcartAction(){
      let data = this.post();
      data = think.extend({},data);
      let arr=[];
      let cart = this.cookie("cart_goods_item");
      if(think.isEmpty(cart)){
         arr.push(data);
      }else{
          cart = JSON.parse(cart);
          //console.log(cart);
          let typearr = []
          //已有购物车数量相加
         for(let item of cart){
             if(item.type == data.type){
                item.qty = Number(item.qty) + Number(data.qty);
             }
             arr.push(item);
             typearr.push(item.type);  
         }
         //没有直接添加商品
          if(!in_array(data.type,typearr)){
              arr.splice(0, 0,data);
          };
      }
      console.log(arr);
     
      //获取商品详细信息
      //{total:222,data:[{title:"dfd",price:34,pic:2,}]}
       //arr.push(data);
       let dataarr = [];
       let total = [];
       let num = [];
       for(let val of arr){
           let dataobj = {}
          let goods = await this.model('document').find(val.product_id);
          let table = await this.model('model',{},'admin').get_table_name(goods.model_id);
          let info = await this.model(table).find(val.product_id);
          goods = think.extend(goods,info);
          dataobj.title=goods.title;
         //console.log(goods);
          if(think.isEmpty(goods.suk)){
            dataobj.price=get_price(goods.price,1);
          }else{
            let suk = JSON.parse(goods.suk);
            let arr_ = val.type.split(",");
            let getpr = getsuk(suk.data,arr_);
            dataobj.price = Number(getpr.sku_price) * Number(val.qty);
            //console.log(dataobj.price);   
           }
          dataobj.pic = await get_cover(goods.pics.split(",")[0],'path');
          dataobj.url = get_url(goods.name,goods.id);
          dataobj.product_id = val.product_id;
          dataobj.type = val.type;
          dataobj.qty = Number(val.qty);
          dataarr.push(dataobj);
          total.push(dataobj.price);
          num.push(dataobj.qty);
       }
        //缓存购物车
     this.cookie("cart_goods_item",JSON.stringify(dataarr)); //将 cookie theme 值设置为 default
      let cartinfo = {
          total:eval(total.join('+')),
          num:eval(num.join('+')),
          data:dataarr
      }
    
     return this.json(cartinfo);
  }
}