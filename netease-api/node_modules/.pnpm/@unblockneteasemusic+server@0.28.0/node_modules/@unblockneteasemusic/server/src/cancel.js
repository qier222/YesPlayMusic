const EventEmitter = require('events');
const ON_CANCEL = 'cancel';

class CancelRequest extends EventEmitter {
	/** @type {boolean} */
	cancelled = false;

	cancel() {
		this.cancelled = true;
		this.emit(ON_CANCEL);
	}
}

module.exports = {
	CancelRequest,
	ON_CANCEL,
};
