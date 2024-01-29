import moment, { Moment } from "moment";
import { Subject } from "rxjs";

export interface RxStatusSnapshot<T> {
  state: T;
  pendingMessage: string;
  pendingProgress: number;
  pendingStart: Moment;
  errorMessage: string;
}

type SnapshotRequiredFields = "state";
type InitialStatusSnapshot<T> = Pick<
  RxStatusSnapshot<T>,
  SnapshotRequiredFields
> &
  Partial<Omit<RxStatusSnapshot<T>, SnapshotRequiredFields>>;

export class RxStatus<T> {
  readonly subject = new Subject<RxStatusSnapshot<T>>();

  constructor(init: InitialStatusSnapshot<T>) {
    this.subject.next({
      state: init.state,
      pendingMessage: init.pendingMessage ?? "",
      pendingProgress: init.pendingProgress ?? 0,
      pendingStart: init.pendingStart ?? moment(),
      errorMessage: init.errorMessage ?? "",
    });
  }

  push(update: Partial<RxStatusSnapshot<T>>) {
    const sub = this.subject.subscribe((current) => {
      sub.unsubscribe();
      this.subject.next({ ...current, ...update });
    });
  }
}
