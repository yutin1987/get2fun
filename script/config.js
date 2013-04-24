var ADDRESS = location.host;

var PATH = '/hg2/';

var API = {
	TASK: 'api/dls5.php',
	LOGIN: 'api2/login2.php',
	INFO: 'api2/info.php'
}

var WATCH_TIME = 1000;

var STATUS = {
	RELOAD: 0,
	CANCEL: 1,
	WAIT: 2,
	DOWNLOAD: 3,
	COMPLETE: 4,
	FAIL: 5
};

var TYPE = {
	IMAGE: 'photo',
	SOUND: 'audio',
	VIDEO: 'video',
	ALBUM: 'album'
};

/**
 *	For designer
 */

var STATUS_NAME = new Array();
STATUS_NAME[STATUS.WAIT] = 'wait';
STATUS_NAME[STATUS.DOWNLOAD] = 'download';
STATUS_NAME[STATUS.CANCEL] = 'canceled';
STATUS_NAME[STATUS.COMPLETE] = 'completed';
STATUS_NAME[STATUS.FAIL] = 'failed';
STATUS_NAME[STATUS.RELOAD] = 'reloaded';