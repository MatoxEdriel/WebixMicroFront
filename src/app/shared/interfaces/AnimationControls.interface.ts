import {AnimationOptions} from 'ngx-lottie';

export interface ILottieAnimation{
    name: string;
    options: AnimationOptions;
    loop?: boolean;
    autoplay?:boolean;
}