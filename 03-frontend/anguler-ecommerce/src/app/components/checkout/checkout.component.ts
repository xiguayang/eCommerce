import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Country } from 'src/app/common/country';
import { State } from 'src/app/common/state';
import { EShopFormService } from '../../services/e-shop-form.service';

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
              private eShopFormService: EShopFormService) { }

  ngOnInit(): void {

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName:[''],
        lastName:[''],
        email:['']
      }),
      shippingAddress: this.formBuilder.group({
        street:[''],
        city:[''],
        state:[''],
        country:[''],
        zipCode:['']
      }),
      billingAddress: this.formBuilder.group({
        street:[''],
        city:[''],
        state:[''],
        country:[''],
        zipCode:['']
      }),
      creditCard: this.formBuilder.group({
        cardType:[''],
        nameOnCard:[''],
        cardNumber:[''],
        securityCode:[''],
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
    
  }

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

  }

}
