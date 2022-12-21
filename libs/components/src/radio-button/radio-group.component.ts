import { coerceBooleanProperty } from "@angular/cdk/coercion";
import { Component, ContentChild, HostBinding, Input, Optional, Self } from "@angular/core";
import { ControlValueAccessor, NgControl } from "@angular/forms";

import { BitLabel } from "../form-control/label.directive";

let nextId = 0;

@Component({
  selector: "bit-radio-group",
  templateUrl: "radio-group.component.html",
})
export class RadioGroupComponent implements ControlValueAccessor {
  selected: unknown;
  disabled = false;

  private _inline = false;
  @Input() get inline() {
    return this._inline;
  }
  set inline(value: boolean | "") {
    this._inline = coerceBooleanProperty(value);
  }

  private _name?: string;
  @Input() get name() {
    return this._name ?? this.ngControl?.name?.toString();
  }
  set name(value: string) {
    this._name = value;
  }

  @HostBinding("attr.role") role = "radiogroup";
  @HostBinding("attr.id") @Input() id = `bit-radio-group-${nextId++}`;

  @HostBinding("class")
  get classes() {
    return ["tw-block"].concat(this.inline ? ["tw-mb-6"] : ["tw-mb-3"]);
  }

  @ContentChild(BitLabel) protected label: BitLabel;

  constructor(@Optional() @Self() private ngControl?: NgControl) {
    if (ngControl != null) {
      ngControl.valueAccessor = this;
    }
  }

  // ControlValueAccessor
  onChange: (value: unknown) => void;
  onTouched: () => void;

  writeValue(value: boolean): void {
    this.selected = value;
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInputChange(value: unknown) {
    this.selected = value;
    this.onChange(this.selected);
  }

  onBlur() {
    this.onTouched();
  }
}
