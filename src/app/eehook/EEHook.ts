import { interval } from 'rxjs';
import { HostListener, EventEmitter, Directive,Output } from '@angular/core';

@Directive({
    selector: '[eehook]'
  })
export class EEHook {

    private sequence: string[];
    private teamCode: string[];

    private _timer: any;
    private _timerSub: any;

    @Output()
    public eehook: EventEmitter<void>;

    constructor(){
        //console.log(">>>>>>>>>>>>>>>>>>>>>>> Ctor ");
        this.eehook = new EventEmitter<void>();
        this.sequence = [];
        this.teamCode = [ "99", "104", "105", "110", "111", "116", "116", "111", "102", "111", "114", "101", "118", "101", "114" ];
    }
    
    @HostListener('document:keypress', ['$event'])
    public processKeyEvent(event: KeyboardEvent){
        //console.log(">>>>>>>>>>>>>>>>>>>>>>> processKeyEvent ", event, event.key, event.keyCode);
        this.checkForTimer();
        if (event.keyCode) {
            this.sequence.push(event.keyCode.toString());
            
            //console.log(">>>>>>>>>>>>>>>>>>>>>>> ", this.sequence);

            if (this.sequence.length > this.teamCode.length) {
              //this.sequence.shift();
              this.resetSequence();
            }
      
            if (this.isTeamCode()) {
              this.triggerEvent();
            }
          }
    }

    private checkForTimer(){
        if (this._timer){
            return;
        } else {
            this._timer = interval(4000);
            this._timerSub = this._timer.subscribe( n => {
                this.resetSequence(),
                this._timer = null;
            });
        }
    }
    
    isTeamCode(): boolean {
        return this.teamCode.every((code: string, index: number) => code === this.sequence[index]);
    }


    private triggerEvent(){
        //console.log(">>>>>>>>>>>>>>>>>>>>>>> FIRE!");
        this.eehook.emit();
        if (this._timer){
            this._timerSub.unsubscribe();
            this._timer = null;
        }
        this.resetSequence();
    }

    private resetSequence(){
        this.sequence = [];
    }

}
