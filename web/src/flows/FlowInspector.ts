import { t } from "@lingui/macro";

import { css, CSSResult, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";

import AKGlobal from "../authentik.css";
import PFCard from "@patternfly/patternfly/components/Card/card.css";
import PFDescriptionList from "@patternfly/patternfly/components/DescriptionList/description-list.css";
import PFNotificationDrawer from "@patternfly/patternfly/components/NotificationDrawer/notification-drawer.css";
import PFProgressStepper from "@patternfly/patternfly/components/ProgressStepper/progress-stepper.css";
import PFStack from "@patternfly/patternfly/layouts/Stack/stack.css";
import PFBase from "@patternfly/patternfly/patternfly-base.css";

import { FlowInspection, FlowsApi, Stage } from "@goauthentik/api";

import { DEFAULT_CONFIG } from "../api/Config";
import { EVENT_FLOW_ADVANCE } from "../constants";
import "../elements/Expand";

@customElement("ak-flow-inspector")
export class FlowInspector extends LitElement {
    flowSlug: string;

    @property({ attribute: false })
    state?: FlowInspection;

    @property({ attribute: false })
    error?: Response;

    static get styles(): CSSResult[] {
        return [
            PFBase,
            PFStack,
            PFCard,
            PFNotificationDrawer,
            PFDescriptionList,
            PFProgressStepper,
            AKGlobal,
            css`
                code.break {
                    word-break: break-all;
                }
            `,
        ];
    }

    constructor() {
        super();
        this.flowSlug = window.location.pathname.split("/")[3];
        window.addEventListener(EVENT_FLOW_ADVANCE, this.advanceHandler as EventListener);
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        window.removeEventListener(EVENT_FLOW_ADVANCE, this.advanceHandler as EventListener);
    }

    advanceHandler = (): void => {
        new FlowsApi(DEFAULT_CONFIG)
            .flowsInspectorGet({
                flowSlug: this.flowSlug,
            })
            .then((state) => {
                this.state = state;
            })
            .catch((exc) => {
                this.error = exc;
            });
    };

    // getStage return a stage without flowSet, for brevity
    getStage(stage?: Stage): unknown {
        if (!stage) {
            return stage;
        }
        delete stage.flowSet;
        return stage;
    }

    renderAccessDenied(): TemplateResult {
        return html`<div class="pf-c-drawer__body pf-m-no-padding">
            <div class="pf-c-notification-drawer">
                <div class="pf-c-notification-drawer__header">
                    <div class="text">
                        <h1 class="pf-c-notification-drawer__header-title">${t`Flow inspector`}</h1>
                    </div>
                </div>
                <div class="pf-c-notification-drawer__body">
                    <div class="pf-l-stack pf-m-gutter">
                        <div class="pf-l-stack__item">
                            <div class="pf-c-card">
                                <div class="pf-c-card__body">${this.error?.statusText}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    }

    render(): TemplateResult {
        if (this.error) {
            return this.renderAccessDenied();
        }
        if (!this.state) {
            return html`<ak-empty-state ?loading="${true}" header=${t`Loading`}> </ak-empty-state>`;
        }
        return html`<div class="pf-c-drawer__body pf-m-no-padding">
            <div class="pf-c-notification-drawer">
                <div class="pf-c-notification-drawer__header">
                    <div class="text">
                        <h1 class="pf-c-notification-drawer__header-title">${t`Flow inspector`}</h1>
                    </div>
                </div>
                <div class="pf-c-notification-drawer__body">
                    <div class="pf-l-stack pf-m-gutter">
                        <div class="pf-l-stack__item">
                            <div class="pf-c-card">
                                <div class="pf-c-card__header">
                                    <div class="pf-c-card__title">${t`Next stage`}</div>
                                </div>
                                <div class="pf-c-card__body">
                                    <dl class="pf-c-description-list">
                                        <div class="pf-c-description-list__group">
                                            <dt class="pf-c-description-list__term">
                                                <span class="pf-c-description-list__text"
                                                    >${t`Stage name`}</span
                                                >
                                            </dt>
                                            <dd class="pf-c-description-list__description">
                                                <div class="pf-c-description-list__text">
                                                    ${this.state.currentPlan?.nextPlannedStage
                                                        ?.stageObj?.name || "-"}
                                                </div>
                                            </dd>
                                        </div>
                                        <div class="pf-c-description-list__group">
                                            <dt class="pf-c-description-list__term">
                                                <span class="pf-c-description-list__text"
                                                    >${t`Stage kind`}</span
                                                >
                                            </dt>
                                            <dd class="pf-c-description-list__description">
                                                <div class="pf-c-description-list__text">
                                                    ${this.state.currentPlan?.nextPlannedStage
                                                        ?.stageObj?.verboseName || "-"}
                                                </div>
                                            </dd>
                                        </div>
                                        <div class="pf-c-description-list__group">
                                            <dt class="pf-c-description-list__term">
                                                <span class="pf-c-description-list__text"
                                                    >${t`Stage object`}</span
                                                >
                                            </dt>
                                            <dd class="pf-c-description-list__description">
                                                ${this.state.isCompleted
                                                    ? html` <div
                                                          class="pf-c-description-list__text"
                                                      >
                                                          ${t`This flow is completed.`}
                                                      </div>`
                                                    : html`<ak-expand>
                                                          <pre class="pf-c-description-list__text">
${JSON.stringify(this.getStage(this.state.currentPlan?.nextPlannedStage?.stageObj), null, 4)}</pre
                                                          >
                                                      </ak-expand>`}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>
                        </div>
                        <div class="pf-l-stack__item">
                            <div class="pf-c-card">
                                <div class="pf-c-card__header">
                                    <div class="pf-c-card__title">${t`Plan history`}</div>
                                </div>
                                <div class="pf-c-card__body">
                                    <ol class="pf-c-progress-stepper pf-m-vertical">
                                        ${this.state.plans.map((plan) => {
                                            return html`<li
                                                class="pf-c-progress-stepper__step pf-m-success"
                                            >
                                                <div class="pf-c-progress-stepper__step-connector">
                                                    <span class="pf-c-progress-stepper__step-icon">
                                                        <i
                                                            class="fas fa-check-circle"
                                                            aria-hidden="true"
                                                        ></i>
                                                    </span>
                                                </div>
                                                <div class="pf-c-progress-stepper__step-main">
                                                    <div class="pf-c-progress-stepper__step-title">
                                                        ${plan.currentStage.stageObj?.name}
                                                    </div>
                                                    <div
                                                        class="pf-c-progress-stepper__step-description"
                                                    >
                                                        ${plan.currentStage.stageObj?.verboseName}
                                                    </div>
                                                </div>
                                            </li> `;
                                        })}
                                        ${this.state.currentPlan?.currentStage &&
                                        !this.state.isCompleted
                                            ? html` <li
                                                  class="pf-c-progress-stepper__step pf-m-current pf-m-info"
                                              >
                                                  <div
                                                      class="pf-c-progress-stepper__step-connector"
                                                  >
                                                      <span
                                                          class="pf-c-progress-stepper__step-icon"
                                                      >
                                                          <i
                                                              class="pficon pf-icon-resources-full"
                                                              aria-hidden="true"
                                                          ></i>
                                                      </span>
                                                  </div>
                                                  <div class="pf-c-progress-stepper__step-main">
                                                      <div
                                                          class="pf-c-progress-stepper__step-title"
                                                      >
                                                          ${this.state.currentPlan?.currentStage
                                                              ?.stageObj?.name}
                                                      </div>
                                                      <div
                                                          class="pf-c-progress-stepper__step-description"
                                                      >
                                                          ${this.state.currentPlan?.currentStage
                                                              ?.stageObj?.verboseName}
                                                      </div>
                                                  </div>
                                              </li>`
                                            : html``}
                                        ${this.state.currentPlan?.nextPlannedStage &&
                                        !this.state.isCompleted
                                            ? html`<li
                                                  class="pf-c-progress-stepper__step pf-m-pending"
                                              >
                                                  <div
                                                      class="pf-c-progress-stepper__step-connector"
                                                  >
                                                      <span
                                                          class="pf-c-progress-stepper__step-icon"
                                                      ></span>
                                                  </div>
                                                  <div class="pf-c-progress-stepper__step-main">
                                                      <div
                                                          class="pf-c-progress-stepper__step-title"
                                                      >
                                                          ${this.state.currentPlan.nextPlannedStage
                                                              .stageObj?.name}
                                                      </div>
                                                      <div
                                                          class="pf-c-progress-stepper__step-description"
                                                      >
                                                          ${this.state.currentPlan?.nextPlannedStage
                                                              ?.stageObj?.verboseName}
                                                      </div>
                                                  </div>
                                              </li>`
                                            : html``}
                                    </ol>
                                </div>
                            </div>
                        </div>
                        <div class="pf-l-stack__item">
                            <div class="pf-c-card">
                                <div class="pf-c-card__header">
                                    <div class="pf-c-card__title">${t`Current plan cntext`}</div>
                                </div>
                                <div class="pf-c-card__body">
                                    <pre>
${JSON.stringify(this.state.currentPlan?.planContext, null, 4)}</pre
                                    >
                                </div>
                            </div>
                        </div>
                        <div class="pf-l-stack__item">
                            <div class="pf-c-card">
                                <div class="pf-c-card__header">
                                    <div class="pf-c-card__title">${t`Session ID`}</div>
                                </div>
                                <div class="pf-c-card__body">
                                    <code class="break">${this.state.currentPlan?.sessionId}</code>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    }
}