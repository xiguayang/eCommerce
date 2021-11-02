import { FormControl, ValidationErrors } from '@angular/forms';
export class EshopValidators{
    //define whitespace validatoion
    //if validation check fails then return validation error(s), else return null
    // Map of errors returned from failed validation checks
    static notOnlyWhitespace(control: FormControl): ValidationErrors{
        //check if string only contains whitespace
        if((control.value!=null)&& (control.value.trim().length ===0)){
            //invalid: return error object
            //Validation error key: 'notOnlyWhitespace'
            //The HTML template will check for this error key
            return {'notOnlyWhitespace': true}
        }else{
            //valid, return null
            return null;
        }
    }
}