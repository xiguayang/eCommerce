import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from 'src/app/services/product.service';
import { Product } from '../../common/product';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {
  product: Product = new Product();
  constructor(private productService: ProductService, private route:ActivatedRoute ) { }
  ngOnInit() {
    this.route.paramMap.subscribe(()=>{
      this.handleProductDetail();
    })
  }
  
  handleProductDetail(){
    //get the 'id' param string. convert string to number using +
    const theProductId: number =+this.route.snapshot.paramMap.get('id')
    this.productService.getProduct(theProductId).subscribe(
      data=>{
        this.product=data;
      }
    )
  }

}
