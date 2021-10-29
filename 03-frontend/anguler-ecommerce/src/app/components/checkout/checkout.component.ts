import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Country } from 'src/app/common/country';
import { State } from 'src/app/common/state';
import { CartService } from 'src/app/services/cart.service';
import { EShopFormService } from '../../services/e-shop-form.service';
import { EshopValidators } from '../../validators/eshop-validators';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  checkoutFormGroup: FormGroup;
  totalPrice: number=0;
  totalQuantity: number=0;
  creditCardYear: number[]=[];
  creditCardMonth: number[]=[];
  countries:Country[]=[];
  shippingAddressStates: State[]=[];
  billingAddressStates: State[]=[];
  constructor(private formBuilder: FormBuilder,
              private eShopFormService: EShopFormService,
              private cartService: CartService) { }

  ngOnInit(): void {

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('',[Validators.required, Validators.minLength(2), EshopValidators.notOnlyWhitespace]),
        lastName: new FormControl('',[Validators.required, Validators.minLength(2), EshopValidators.notOnlyWhitespace]),
        email: new FormControl('', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'), EshopValidators.notOnlyWhitespace])
      }),
      shippingAddress: this.formBuilder.group({
        street:new FormControl('',[Validators.required, Validators.minLength(2), EshopValidators.notOnlyWhitespace]),
        city:new FormControl('',[Validators.required, Validators.minLength(2), EshopValidators.notOnlyWhitespace] ),
        state:new FormControl('',[Validators.required]),
        country:new FormControl('',[Validators.required] ),
        zipCode:new FormControl('',[Validators.required, Validators.minLength(2), EshopValidators.notOnlyWhitespace]),
      }),
      billingAddress: this.formBuilder.group({
        street:new FormControl('',[Validators.required, Validators.minLength(2), EshopValidators.notOnlyWhitespace]),
        city:new FormControl('',[Validators.required, Validators.minLength(2), EshopValidators.notOnlyWhitespace] ),
        state:new FormControl('',[Validators.required]),
        country:new FormControl('',[Validators.required] ),
        zipCode:new FormControl('',[Validators.required, Validators.minLength(2), EshopValidators.notOnlyWhitespace]),
      }),
      creditCard: this.formBuilder.group({
        cardType:new FormControl('',[Validators.required ]),
        nameOnCard:new FormControl('',[Validators.required, Validators.minLength(2), EshopValidators.notOnlyWhitespace]),
        cardNumber:new FormControl('',[Validators.required, Validators.pattern('[0-9]{16}')]),
        securityCode:new FormControl('',[Validators.required, Validators.pattern('[0-9]{3}')]),
        expirationMonth:[''],
        expirationYear:['']
      }),
    });
    
    // populate credit card months
    const startMonth: number = new Date().getMonth() + 1;

    this.eShopFormService.getCreditCardMonths(startMonth).subscribe((data) => {
      //console.log('Retrieved credit card months: ' + JSON.stringify(data));
      this.creditCardMonth = data;
    });

    // populate credit card years
    this.eShopFormService.getCreditCardYears().subscribe((data) => {
      //console.log('Retrieved credit card years: ' + JSON.stringify(data));
      this.creditCardYear = data;
    });

    //populate countries
    this.eShopFormService.getCountries().subscribe((data)=>{this.countries = data;})

    this.reviewCartDetails();
    
  }

  //getter
  get firstName(){return this.checkoutFormGroup.get('customer.firstName');}
  get lastName(){return this.checkoutFormGroup.get('customer.lastName');}
  get email(){return this.checkoutFormGroup.get('customer.email');}

  get shippingAddressStreet(){return this.checkoutFormGroup.get('shippingAddress.street');}
  get shippingAddressCity(){return this.checkoutFormGroup.get('shippingAddress.city');}
  get shippingAddressZipCode(){return this.checkoutFormGroup.get('shippingAddress.zipCode');}
  get shippingAddressCountry(){return this.checkoutFormGroup.get('shippingAddress.country');}
  get shippingAddressState(){return this.checkoutFormGroup.get('shippingAddress.state');}

  get billingAddressStreet(){return this.checkoutFormGroup.get('billingAddress.street');}
  get billingAddressCity(){return this.checkoutFormGroup.get('billingAddress.city');}
  get billingAddressZipCode(){return this.checkoutFormGroup.get('billingAddress.zipCode');}
  get billingAddressCountry(){return this.checkoutFormGroup.get('billingAddress.country');}
  get billingAddressState(){return this.checkoutFormGroup.get('billingAddress.state');}

  get creditCardType(){return this.checkoutFormGroup.get('creditCard.cardType');}
  get creditCardNameOnCard(){return this.checkoutFormGroup.get('creditCard.nameOnCard');}
  get creditCardNumber(){return this.checkoutFormGroup.get('creditCard.cardNumber');}
  get creditCardSecurityCode(){return this.checkoutFormGroup.get('creditCard.securityCode');}


  copyShippingAddressToBillingAddress(event){
    if(event.target.checked){
      this.checkoutFormGroup.controls.billingAddress
      .setValue(this.checkoutFormGroup.controls.shippingAddress.value)
      //bug fix for state population
      this.billingAddressStates=this.shippingAddressStates;
    }else{
      this.checkoutFormGroup.controls.billingAddress.reset();
      //bug fix for states populating
      this.billingAddressStates=[]
    }
  }
  handleMonthsAndYears(){
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');
    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup.value.expirationYear)
    //if the current year equals the selected year, then month starts from current month
    let startMonth: number;
    if(currentYear===selectedYear){
      startMonth=new Date().getMonth()+1;
    }else{
      startMonth=1;
    }
    //populate credit card months
    this.eShopFormService.getCreditCardMonths(startMonth).subscribe(
      data=>{
        console.log("Retrieved credit card months: "+ JSON.stringify(data));
        this.creditCardMonth=data
      }
    )
    //populate credit card years
    this.eShopFormService.getCreditCardYears().subscribe(
      data=>{
        this.creditCardYear=data;
      }
    )

  }
  getStates(formGroupName:string){
    const formGroup = this.checkoutFormGroup.get(formGroupName);
    const countryCode = formGroup.value.country.code;
    this.eShopFormService.getStates(countryCode).subscribe(
      data=>{
        if(formGroupName ==="shippingAddress"){
          this.shippingAddressStates=data;
        }else{
          this.billingAddressStates=data;
        }
        //select first item by default
        formGroup.get('state').setValue(data[0])
      }
    )
  }
  onSubmit(){
    console.log("Handling the submit button");
    console.log(this.checkoutFormGroup.get('customer').value);
    console.log(this.checkoutFormGroup.get('customer').value.email);
    console.log(this.checkoutFormGroup.get('shippingAddress').value.country.name);
    console.log(this.checkoutFormGroup.get('shippingAddress').value.state.name);
    if(this.checkoutFormGroup.invalid){
      this.checkoutFormGroup.markAllAsTouched();
    }
    console.log("CheckedFormGroup is valid: "+ this.checkoutFormGroup.valid);

  }
  reviewCartDetails(){

    //subscribe to the cart totalPrice
    this.cartService.totalPrice.subscribe(
      data=>this.totalPrice=data
    )
    //subscribe to the cart totalQuantity
    this.cartService.totalQuantity.subscribe(
      data=>this.totalQuantity=data
    )
  }

}
