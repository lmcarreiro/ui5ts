import { Gulpclass, Task, SequenceTask } from "gulpclass";
import * as gulp from 'gulp';
import Generator from './src/generator';

@Gulpclass()
export class Gulpfile {

   @Task()
   default() {
       new Generator().generate();
   }

}