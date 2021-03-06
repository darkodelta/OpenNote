/**
 * @author - Jake Liscom 
 * @project - OpenNote
 */

/**
 * Control 
 */
openNote.controller("listController", function(	$scope, 
												$rootScope, 
												folderFactory,
												$timeout,
												userService) {	
	$scope.data = new folderFactory();
	
	/**
	 * Toggle collapse
	 */
    $scope.toggle = function(scope) {
    	scope.toggle();
    };
    
    /**
     * get the root node scope
     */
    var getRootNodesScope = function() {
    	return angular.element(document.getElementById("tree-root")).scope();
    };
    
    /**
     * Collapse All
     */
    $scope.collapseAll = function() {
    	var scope = getRootNodesScope();
    	scope.collapseAll();
    };

    /**
     * expand all
     */
    $scope.expandAll = function() {
    	var scope = getRootNodesScope();
    	scope.expandAll();
    };

    /**
     * Load list view
     */
    $rootScope.$on("reloadListView", function(event, args) {
	    $scope.data.$get({levels:100, includeNotes: false}).then(function(result){
	    	$scope.treeBuffer = 0;
	    	$scope.data=result;
	    	increaseTreeBuffer();
	    });
    });
    
    /**
     * List Config object
     */
    $scope.options = {
    	/**
    	 * Drag event logic
    	 */
		beforeDrop: function(event) {
	    	var sourceFolder = event.source.nodeScope.$modelValue;
	    	
	    	var destFolder=null;
	    	if(event.dest.nodesScope.$nodeScope != null)
	    		destFolder = event.dest.nodesScope.$nodeScope.$modelValue;
	        
	        var destName="Home";
        	var destID = null
        	if(destFolder!=null){//is dest the home folder?
        		destName=destFolder.name;//Set defaults
        		destID = destFolder.id;
        	}
	        
	        if(sourceFolder.parrentFolderID!=destID){
	        	//Confirm action
	        	alertify.confirm("Are you sure you want to move "+sourceFolder.name+" into "+ destName+"?" , function (confirm) {
	        	    if (confirm) {
	        	    	var folderType = new folderFactory();
	        	    	var origParrentFolderID=sourceFolder.parrentFolderID;
	        	    	
	        	    	sourceFolder.__proto__=folderType.__proto__;//Cast this object as a resources
	        	    	
	        	    	sourceFolder.parrentFolderID=destID;
	        	    	sourceFolder.$update().then(function(){//wait for a response
	        	    		//fire off an event to tell everyone we just modified a folder
			        	    	$rootScope.$emit("changedFolder", {
			        	    		folder: sourceFolder, 
			        	    		oldParrentFolderID: origParrentFolderID
			        	    	});
	        	    	});
	        	    }
	        	    else
	        	    	$rootScope.$emit("reloadListView", {}); //refresh either way
	        	    //event.source.nodeScope.$$apply = false;
	        	    //TODO if they cancel reset list instead of re pulling it
	        	});
	        }	
	    }
    };
    
    /**
    * Render list slowly
    */
    var increaseTreeBuffer = function(){
        if($scope.treeBuffer<=100) {
        	$scope.treeBuffer++;
            $timeout(increaseTreeBuffer, 500);
        }
        else
            $rootScope.$emit("listLoaded", {});//Tell the world we are done
    }
    
    //Load the lists initially
    if(userService.hasValidToken())
    	$rootScope.$emit("reloadListView");
});