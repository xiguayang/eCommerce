import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { CartItem } from '../common/cart-item';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  //our shopping cart is an array of CartItem Objects
  cartItems: CartItem[]=[];
  totalPrice: Subject<number> = new BehaviorSubject<number>(0);
  totalQuantity:  Subject<number> = new BehaviorSubject<number>(0);
  //reference to web browser's session storage
  //storage: Storage = sessionStorage;
  storage: Storage=localStorage;//data is persisted and survives brwoser restarts

  constructor() { 
    //read data from storage
    //JSON.parse(): read JSON string and converts to object
    let data = JSON.parse(this.storage.getItem('cartItems'));
    if(data!=null){
      this.cartItems=data;
      //compute the totals based on data that is read from storage
      this.computeCartTotals()
    }
  }
  //JSON.stringify(...): convert object to JSON string
  persistCartItems(){
    this.storage.setItem('cartItems', JSON.stringify(this.cartItems));
  }
  addToCart(theCartItem: CartItem){
    //check if we already have the item in our cart
    let alreadyExistsInCart: boolean=false;
    let existingCartItem: CartItem=undefined;

    if(this.cartItems.length>0){
      //find the item in the cart based on item id
      // for(let tempCartItem of this.cartItems){
      //   if(tempCartItem.id === theCartItem.id){
      //     existingCartItem=tempCartItem;
      //     break;
      //   }
      // }
      //refactor the for loop to find the item in the cart based on item id
      //the find method is instance method for Array.find()
      //returns the first element in an array t hat passes a given test
      existingCartItem = this.cartItems.find(tempCartItem => tempCartItem.id === theCartItem.id);
      //check if we found it in cart
      alreadyExistsInCart=(existingCartItem!=undefined);
    }
    //if the item is already in the cart
    if(alreadyExistsInCart){
      //increment the quantity
      existingCartItem.quantity++;
    }else{
      //just add the item into the array
      this.cartItems.push(theCartItem);
    }
    //compute cart quantity and the total price
    this.computeCartTotals();
  }
  computeCartTotals() {
    let totalPriceValue: number =0;
    let totalQuantityValue: number =0;
    for(let currentCartItem of this.cartItems){
      totalPriceValue+=currentCartItem.unitPrice*currentCartItem.quantity;
      totalQuantityValue+=currentCartItem.quantity;
    }
    //publish the new values ... all subscribers will recieve the new data
    //one event for totalPrice
    //one event for totalQuantity
    //.next(...) publish/send events
    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);
    //log cart data just for debugging purpose
    this.logCartData(totalPriceValue,totalQuantityValue);
    //persist cart data
    this.persistCartItems()
  }
  logCartData(totalPriceValue: number, totalQuantityValue: number) {
    console.log('Contents of the cart');
    for(let tempCartItem of this.cartItems){
      const subTotalPrice = tempCartItem.quantity*tempCartItem.unitPrice;
      console.log(`name: ${tempCartItem.name}, quantity: ${tempCartItem.quantity}, unitPrice=${tempCartItem.unitPrice}, subTotalPrice=${subTotalPrice}`)

    }
    console.log(`totalPrice: ${totalPriceValue.toFixed(2)}, totalQuantity: ${totalQuantityValue}`)
    console.log('--------------------')
  }
  decrementQuantity(theCartItem: CartItem) {
    theCartItem.quantity--;
    if(theCartItem.quantity===0){
      this.remove(theCartItem);
    }else{
      this.computeCartTotals();
    }
  }
  remove(theCartItem:CartItem){
    //get the index of item in the array
    const itemIndex = this.cartItems.findIndex(tempCartItem => tempCartItem.id == theCartItem.id);
    //if found, remove the item from the array at the given index
    if(itemIndex>-1){
      this.cartItems.splice(itemIndex,1);
      this.computeCartTotals();
    }
  }
}
