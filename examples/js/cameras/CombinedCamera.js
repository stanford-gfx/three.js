/**
 *	@author zz85 / http://twitter.com/blurspline / http://www.lab4games.net/zz85/blog
 *
 *	A general perpose camera, for setting FOV, Lens Focal Length,
 *		and switching between perspective and orthographic views easily.
 *		Use this only if you do not wish to manage
 *		both a Orthographic and Perspective Camera
 *
 */


THREE.CombinedCamera = function ( width, height, fov, near, far, orthoNear, orthoFar ) {

	THREE.Camera.call( this );

	this.fov = fov;

	this.left = - width / 2;
	this.right = width / 2;
	this.top = height / 2;
	this.bottom = - height / 2;
	this.aspect = width / height;

	// We could also handle the projectionMatrix internally, but just wanted to test nested camera objects

	this.cameraO = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 	orthoNear, orthoFar );
	this.cameraP = new THREE.PerspectiveCamera( fov, this.aspect, near, far );

	this.zoom = 1;

	this.toPerspective();

};

THREE.CombinedCamera.prototype = Object.create( THREE.Camera.prototype );
THREE.CombinedCamera.prototype.constructor = THREE.CombinedCamera;

THREE.CombinedCamera.prototype.toPerspective = function () {

	// Switches to the Perspective Camera
	this.cameraP.up = this.up;
	this.cameraP.matrix = this.matrix;
	this.cameraP.matrix.decompose(this.cameraP.position, this.cameraP.quaternion, this.cameraP.scale);
	this.cameraP.matrixWorldNeedsUpdate = true;  // make sure matrixWorldNeedsUpdate is set
	this.cameraP.aspect = this.aspect;

	this.near = this.cameraP.near;
	this.far = this.cameraP.far;

	//this.cameraP.fov =  this.fov / this.zoom ;
	this.cameraP.fov =  this.fov;

	this.cameraP.updateProjectionMatrix();

	this.projectionMatrix = this.cameraP.projectionMatrix;

	this.inPerspectiveMode = true;
	this.inOrthographicMode = false;

};

THREE.CombinedCamera.prototype.toOrthographic = function (target) {
	// Switches to the Orthographic camera estimating viewport from Perspective
	this.cameraO.up = this.up;
	this.cameraO.matrix = this.matrix;
	this.cameraO.matrix.decompose(this.cameraO.position, this.cameraO.quaternion, this.cameraO.scale);
	this.cameraO.matrixWorldNeedsUpdate = true;  // make sure matrixWorldNeedsUpdate is set

	var fov = this.fov;
	var aspect = this.aspect;
	var near = this.cameraP.near;
	var far = this.cameraP.far;

	// The size that we set is the mid plane of the viewing frustum
	if (target) {
		this.hyperfocus = target.clone().sub(this.position).length();
	}
	var hyperfocus = this.hyperfocus? this.hyperfocus : (near + far) / 2;

	var halfHeight = Math.tan( fov * Math.PI / 180 / 2 ) * hyperfocus;
	var planeHeight = 2 * halfHeight;
	var planeWidth = planeHeight * aspect;
	var halfWidth = planeWidth / 2;

	halfHeight /= this.zoom;
	halfWidth /= this.zoom;

	this.cameraO.left = - halfWidth;
	this.cameraO.right = halfWidth;
	this.cameraO.top = halfHeight;
	this.cameraO.bottom = - halfHeight;

	// this.cameraO.left = -farHalfWidth;
	// this.cameraO.right = farHalfWidth;
	// this.cameraO.top = farHalfHeight;
	// this.cameraO.bottom = -farHalfHeight;

	// this.cameraO.left = this.left / this.zoom;
	// this.cameraO.right = this.right / this.zoom;
	// this.cameraO.top = this.top / this.zoom;
	// this.cameraO.bottom = this.bottom / this.zoom;

	this.cameraO.updateProjectionMatrix();

	this.near = this.cameraO.near;
	this.far = this.cameraO.far;
	this.projectionMatrix = this.cameraO.projectionMatrix;

	this.inPerspectiveMode = false;
	this.inOrthographicMode = true;

};


THREE.CombinedCamera.prototype.setSize = function( width, height ) {
	this.aspect = width / height;
	this.left = - width / 2;
	this.right = width / 2;
	this.top = height / 2;
	this.bottom = - height / 2;

};


THREE.CombinedCamera.prototype.setFov = function( fov ) {

	this.fov = fov;

	if ( this.inPerspectiveMode ) {

		this.toPerspective();

	} else {

		this.toOrthographic();

	}

};

// For maintaining similar API with PerspectiveCamera

THREE.CombinedCamera.prototype.updateProjectionMatrix = function(target) {

	if ( this.inPerspectiveMode ) {

		this.toPerspective();

	} else {

		this.toOrthographic(target);

	}

};

THREE.CombinedCamera.prototype.updateNearFar = function() {
	this.cameraP.near = this.near;
	this.cameraP.far = this.far;
	this.cameraO.near = this.near;
	this.cameraO.far = this.far;
};

/*
* Uses Focal Length (in mm) to estimate and set FOV
* 35mm (fullframe) camera is used if frame size is not specified;
* Formula based on http://www.bobatkins.com/photography/technical/field_of_view.html
*/
THREE.CombinedCamera.prototype.setLens = function ( focalLength, frameHeight ) {

	if ( frameHeight === undefined ) frameHeight = 24;

	var fov = 2 * THREE.Math.radToDeg( Math.atan( frameHeight / ( focalLength * 2 ) ) );

	this.setFov( fov );

	return fov;

};


THREE.CombinedCamera.prototype.setZoom = function( zoom ) {

	this.zoom = zoom;

	if ( this.inPerspectiveMode ) {

		this.toPerspective();

	} else {

		this.toOrthographic();

	}

};

THREE.CombinedCamera.prototype.toFrontView = function() {

	this.rotation.x = 0;
	this.rotation.y = 0;
	this.rotation.z = 0;

	// should we be modifing the matrix instead?

	this.rotationAutoUpdate = false;

};

THREE.CombinedCamera.prototype.toBackView = function() {

	this.rotation.x = 0;
	this.rotation.y = Math.PI;
	this.rotation.z = 0;
	this.rotationAutoUpdate = false;

};

THREE.CombinedCamera.prototype.toLeftView = function() {

	this.rotation.x = 0;
	this.rotation.y = - Math.PI / 2;
	this.rotation.z = 0;
	this.rotationAutoUpdate = false;

};

THREE.CombinedCamera.prototype.toRightView = function() {

	this.rotation.x = 0;
	this.rotation.y = Math.PI / 2;
	this.rotation.z = 0;
	this.rotationAutoUpdate = false;

};

THREE.CombinedCamera.prototype.toTopView = function() {

	this.rotation.x = - Math.PI / 2;
	this.rotation.y = 0;
	this.rotation.z = 0;
	this.rotationAutoUpdate = false;

};

THREE.CombinedCamera.prototype.toBottomView = function() {

	this.rotation.x = Math.PI / 2;
	this.rotation.y = 0;
	this.rotation.z = 0;
	this.rotationAutoUpdate = false;

};
