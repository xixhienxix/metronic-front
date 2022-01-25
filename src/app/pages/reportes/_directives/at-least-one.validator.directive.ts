import { Directive, Input } from '@angular/core';
import {
  FormGroup,
  NG_VALIDATORS,
  ValidationErrors,
  ValidatorFn,
  Validators,
  Validator,
  AbstractControl
} from '@angular/forms';

@Directive({
  selector: '[appAtLeastOneValidator]',
  providers: [
    {provide: NG_VALIDATORS,useExisting:AtLeastOne_ValidatorDirective, multi: true}
  ]
})
export class AtLeastOne_ValidatorDirective implements Validator {

@Input("requiredIf")
    requiredIf: boolean;

    validate(c:AbstractControl) {
  
       let value = c.value;
        if ((value == null || value == undefined || value == "") && this.requiredIf) {
                return {
                    requiredIf: {condition:this.requiredIf}
                };
        }
        return null;
    }
    
}
