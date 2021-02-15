
import React from 'react';
import { NexBlock } from './NexBases';

export function NexBlockComponent({learnerComponent, instructorComponent, authorComponent}) {

	constructor(props) {
		super(core, instanceSchema);
		this.learnerComponent = learnerComponentClass({});
		this.instructorComponent = instructorComponentClass({});
		this.authorComponent = authorComponentClass({});
	}

	asVanillaNexBlock() {

	}


}

export class ReactNexBlock {


	renderLearnerUiTo(element) {
		React.render(this.learnerComponent, element);
	}

	renderInstructorUiTo(element) {
		React.render(this.instructorComponent || this.learnerComponent, element);
	}

	renderAuthorUiTo(element) {
		if (this.authorComponent) { 
			React.render(this.authorComponent, element);
		} else {
			return super.renderAuthorUiTo(element);
		}
	}

}