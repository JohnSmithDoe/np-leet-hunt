import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { NPBaseSubscriber } from '@shared/np-library';
import { StageService } from '@shared/np-phaser';
import type * as Phaser from 'phaser';
import { filter } from 'rxjs';

import { Answer, Outcome, PlanetEvent, Question, Tone } from '../../events/event.model';
import { shuffled } from '../../events/shuffle';
import { EventChoiceCommittedPayload, PlanetArrivedPayload, SPACE_EVENTS } from '../../space.events';

/**
 * HTML overlay for planet-arrival events (event-system.md §6–§7): intro → question → three answers →
 * optional follow-up → outcome. It walks the tree entirely in the component (no Phaser round-trip per
 * choice) and emits the resolved path + effects back on the game event emitter for the map to apply.
 * Same Phaser→Angular bridge as {@link PlanetInfoComponent}, with the reverse direction added.
 */
@Component({
    selector: 'np-event-dialog',
    templateUrl: './event-dialog.component.html',
    styleUrls: ['./event-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventDialogComponent extends NPBaseSubscriber implements OnInit, OnDestroy {
    #stage = inject(StageService);

    readonly event = signal<PlanetEvent | null>(null);
    readonly question = signal<Question | null>(null);
    /** The current question's answers in randomised display order (data stays good|neutral|bad, §4). */
    readonly displayAnswers = signal<Answer[]>([]);
    readonly outcome = signal<Outcome | null>(null);
    /** The intro is shown only on the root question, not on follow-ups. */
    readonly atRoot = computed(() => !!this.event() && this.question() === this.event()?.root);

    #events?: Phaser.Events.EventEmitter;
    #path: Tone[] = [];

    #onArrived = ({ event }: PlanetArrivedPayload) => {
        this.#path = [];
        this.event.set(event);
        this.#showQuestion(event.root);
    };

    ngOnInit(): void {
        this.listen(
            this.#stage.initialized$.pipe(filter(Boolean)).subscribe(() => {
                this.#events = this.#stage.phaser.game.events;
                this.#events.on(SPACE_EVENTS.PLANET_ARRIVED, this.#onArrived);
            })
        );
    }

    /** Walk to the answer's follow-up question, or to its terminal outcome. */
    choose(answer: Answer): void {
        if (answer.gate) return; // gated answers render locked (§4); ignore taps until gating is wired
        this.#path.push(answer.tone);
        const event = this.event();
        if (answer.cost?.length && event && this.#events) {
            // The stake is paid the moment the branch is committed, before its payoff (event-system.md §8).
            const payload: EventChoiceCommittedPayload = { id: event.id, cost: answer.cost };
            this.#events.emit(SPACE_EVENTS.EVENT_CHOICE_COMMITTED, payload);
        }
        if (answer.followUp) {
            this.#showQuestion(answer.followUp);
        } else if (answer.outcome) {
            this.question.set(null);
            this.displayAnswers.set([]);
            this.outcome.set(answer.outcome);
        }
    }

    /** Show a question, re-rolling its display order so tone is never positional (§4). */
    #showQuestion(question: Question): void {
        this.outcome.set(null);
        this.question.set(question);
        this.displayAnswers.set(shuffled(question.answers));
    }

    /** Close the dialog and hand the outcome's effects back to the map (event-system.md §6/§8). */
    acknowledge(): void {
        const event = this.event();
        const outcome = this.outcome();
        if (event && outcome) {
            this.#events?.emit(SPACE_EVENTS.EVENT_RESOLVED, {
                id: event.id,
                path: this.#path,
                effects: outcome.effects,
            });
        }
        this.event.set(null);
        this.question.set(null);
        this.displayAnswers.set([]);
        this.outcome.set(null);
    }

    override ngOnDestroy(): void {
        this.#events?.off(SPACE_EVENTS.PLANET_ARRIVED, this.#onArrived);
        super.ngOnDestroy();
    }
}
