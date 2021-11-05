import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {of} from 'rxjs'
import { Country } from '../common/country';
import { State } from '../common/state';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class EShopFormService {
  // countries: Country[];
  // states: State[];
  private stateUrl=environment.hahashopUrl+"/states";
  private countryUrl=environment.hahashopUrl+"/countries";
  constructor(private httpClient: HttpClient) { }
  //return an observable array of numbers
  getCreditCardMonths(startMonth: number):Observable<number[]>{
    let data: number[]=[];
    //build an array for 'Month' dropdown list
    // - start at desired startMonth and loop until 12
    for(let theMonth = startMonth; theMonth<=12;theMonth++){
      data.push(theMonth)
    }
    //wrap the objecy(here is array of number) as an Observable using 'of' operator from 'rxjs'
    return of(data);
  }

  getCreditCardYears():Observable<number[]>{
    let data: number[]=[];
    //build an array for 'Year dropdown list
    // - start at current year and loop for next 10
    const startYear: number = new Date().getFullYear();
    const endYear: number=startYear+10;
    for(let theYear = startYear; theYear<=endYear;theYear++){
      data.push(theYear)
    }
    //wrap the object(here is array of number) as an Observable using 'of' operator from 'rxjs'
    return of(data);
  }

  //returns an observable, map the JSON datat from Spring data REST to country array
  getCountries() : Observable<Country[]>{
    return this.httpClient.get<GetResponseCountry>(this.countryUrl).pipe(
      map(responese=>responese._embedded.countries)
    )
  }

  getStates(theCountryCode: string) : Observable<State[]>{
    const url=`${this.stateUrl}/search/findByCountryCode`+`?code=${theCountryCode}`
    return this.httpClient.get<GetResponseStates>(url).pipe(
      map(responese=>responese._embedded.states)
    )
  }

}
//unwraps the JSON from Spring Data REST _embedded entry
interface GetResponseCountry{
  _embedded:{
    countries: Country[];
  }
}
interface GetResponseStates{
  _embedded:{
    states: State[];
  }
}