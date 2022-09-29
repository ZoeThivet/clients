import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation,
} from "@angular/core";
import { BehaviorSubject, debounceTime, Subject, takeUntil } from "rxjs";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { Utils } from "@bitwarden/common/misc/utils";
import { UpdateAvatarRequest } from "@bitwarden/common/models/request/updateAvatarRequest";
import { ProfileResponse } from "@bitwarden/common/models/response/profileResponse";
@Component({
  selector: "app-change-avatar",
  templateUrl: "change-avatar.component.html",
  encapsulation: ViewEncapsulation.None,
  styles: [
    "color-picker { display: inline-block; margin: auto; margin-right: 0;  }",
    "color-picker .color-picker { border: none; }",
  ],
})
export class ChangeAvatarComponent implements OnInit, OnDestroy {
  @Input() profile: ProfileResponse;
  loading = false;
  error: string;
  defaultColorPalette: NamedAvatarColor[] = [
    { name: "brightBlue", color: "#16cbfc" },
    { name: "green", color: "#94cc4b" },
    { name: "orange", color: "#ffb520" },
    { name: "lavender", color: "#e5beed" },
    { name: "yellow", color: "#fcff41" },
    { name: "indigo", color: "#acbdf7" },
    { name: "teal", color: "#8ecdc5" },
    { name: "salmon", color: "#ffa3a3" },
    { name: "pink", color: "#ffa2d4" },
  ];

  constructor(
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService,
    private logService: LogService,
    private apiService: ApiService
  ) {}

  @Output() onSaved = new EventEmitter();
  customColor$ = new BehaviorSubject<string | null>(null);
  customTextColor$ = new BehaviorSubject<string>("#000000");
  customColorSelected = false;
  formPromise: Promise<any>;
  private destroy$ = new Subject<void>();
  currentSelection: string;

  async ngOnInit() {
    this.defaultColorPalette.forEach((c) => (c.name = this.i18nService.t(c.name)));

    this.customColor$.pipe(debounceTime(200), takeUntil(this.destroy$)).subscribe((color) => {
      if (color == null) {
        return;
      }
      this.customTextColor$.next(Utils.pickTextColorBasedOnBgColor(color));
      this.customColorSelected = true;
      this.currentSelection = color;
    });

    const initalValue = Utils.validateHexColor(this.profile.avatarColor)
      ? this.profile.avatarColor
      : "#ffffff";
    this.setSelection(initalValue);
  }

  async showCustomPicker() {
    this.setSelection(this.customColor$.value == null ? "#ffffff" : this.customColor$.value);
  }

  async submit() {
    try {
      if (Utils.validateHexColor(this.currentSelection)) {
        const request = new UpdateAvatarRequest(this.currentSelection);
        this.formPromise = this.apiService.putAvatar(request);
        await this.formPromise;
        this.platformUtilsService.showToast("success", null, this.i18nService.t("avatarUpdated"));
      } else {
        this.platformUtilsService.showToast("error", null, this.i18nService.t("errorOccurred"));
      }
    } catch (e) {
      this.logService.error(e);
      this.platformUtilsService.showToast("error", null, this.i18nService.t("errorOccurred"));
    }
  }

  async ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async setSelection(color: string | null) {
    if (color == null) {
      return;
    }

    color = color.toLowerCase();

    this.defaultColorPalette.filter((x) => x.selected).forEach((c) => (c.selected = false));
    this.customColorSelected = false;
    //Allow for toggle
    if (this.currentSelection === color) {
      this.currentSelection = null;
    } else {
      const selectedColorIndex = this.defaultColorPalette.findIndex((c) => c.color === color);
      if (selectedColorIndex !== -1) {
        this.defaultColorPalette[selectedColorIndex].selected = true;
        this.currentSelection = color;
      } else {
        this.customColor$.next(color);
      }
    }
  }
}

export class NamedAvatarColor {
  name: string;
  color: string;
  selected? = false;
}
