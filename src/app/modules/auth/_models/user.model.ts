import { AuthModel } from './auth.model';
import { AddressModel } from './address.model';
import { SocialNetworksModel } from './social-networks.model';

export class UserModel {


 constructor(
   public username:string,
   public password:string, 
   public fullname:string,
   private _token:string, 
   private _tokenExpirationDate:Date ){ }
  setUser(user: any) {
    // this.id = user.id;
    this.username = user.username || '';
    this.password = user.password || '';
    this.fullname = user.fullname || '';
    // this.pic = user.pic || './assets/media/users/default.jpg';
  
  }

  get (){
    if(!this._tokenExpirationDate || new Date() > this._tokenExpirationDate)
    {return null}
    return this._token
  }
}
