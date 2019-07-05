
let Recently = (()=>{

  let Recently = function( callback , config ){

    this.config = {
      ProductsAmount: 20,
      callback: callback ? callback : false
    };

    let CurrentProduct = document.querySelector('meta[name="product-id"]')

    CurrentProduct ?
      this.config.CurrentProduct = CurrentProduct.getAttribute('content'):
      this.config.CurrentProduct = false

    this.config = { ...this.config , ...config };

    return this.init();

  };

  Recently.prototype.saveProducts = function() {

    const uniq = arr => {
      let object = {}
      for ( let item of arr ){
        object[item] = null
      }        
      return Object.keys(object)
    };

    this.products = uniq(this.products)
      .reverse()
      .slice(0, this.config.ProductsAmount )
      .reverse();

    localStorage.recently_ids = JSON.stringify( this.products ); 

  };

  Recently.prototype.observe = function () {

    if ( this.config.CurrentProduct ) {
      this.products.push(this.config.CurrentProduct);
      this.saveProducts();
    }

  };

  Recently.prototype.render = async function(){

    const Request = async ( link , type ) => {
      const response = await fetch( 
        link, { method : type }
      );
      return await response.json();
    };

    this.productsJSON = ( 
      await Request(`/products_by_id/${this.products.join(',')}.json`, "GET")
    ).products;

    if ( this.config.callback ) {
      this.config.callback( this.productsJSON );
    }

  };

  Recently.prototype.init = async function(){

    this.products = localStorage.recently_ids ? JSON.parse(localStorage.recently_ids) : []

    this.observe();

    await this.render();

    return this;

  };

  return Recently;

})()

// usage example

$((async ()=>{

  Site.Recently = await new Recently( async ( products ) => {

    if ( products.length > 0 ) {

      for ( let product of products ) {
        $('[data-slider="recently"]').append( 
          $('.js-recently-card', $.parseHTML( await $.get(`${location.origin}${product.url}`) ) ).html()
        )
      }

      let _spOptions = {
        slidesPerView: 5,
        spaceBetween: 16,
        breakpoints: {
          480: { slidesPerView: 1 },
          768: { slidesPerView: 2 }
        }
      };

      new Swiper($('[data-slider="recently"]'), _spOptions);

    } else {
      $('[data-slider="recently"]').remove()
    }

  })

})())



