var config = {
    apiKey: "AIzaSyDTKjj1K5M9xELXNfxPsfkmnc19RBVThZY",
    authDomain: "votingtaiwanlandscape.firebaseapp.com",
    databaseURL: "https://votingtaiwanlandscape.firebaseio.com",
    storageBucket: "gs://votingtaiwanlandscape.appspot.com/"
};
firebase.initializeApp(config);
var PostQuantity1 = 999;
var PageNum1 = 0;
var PostQuantity2 = 999;
var PageNum2 = 0;
var arr = new Array();
var ctx = document.getElementById('myChart');
var currentUser = "";
var currentUserName = "";
var voted = "";
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        currentUser = user.uid;
        currentUserName = user.displayName;
        firebase.database().ref('users/' + currentUser + '/userVoted').once('value').then(function(snapshot) {
            voted = snapshot.val();
        });
    }
});
readPostbyVote();

function readPost(PageNum1) {
    CountPostQuantity();
    $('.list').empty();
    var PostNum = (PageNum1 - 1) * 9;

    PostNum = PostQuantity1 - PostNum;

    PostNumS = PostNum.toString();
    console.log(PostNum);
    if (PostNum < 9) {
        var dataRef = firebase.database().ref("post").orderByKey().endAt(PostNumS).limitToLast(PostNum);
    } else {
        var dataRef = firebase.database().ref("post").orderByKey().endAt(PostNumS).limitToLast(9);
    }

    dataRef.on('child_added', function(data) {
        var html = createElement(data.key, data.val().postTitle, data.val().postImage, data.val().postVote);
        $('.list').prepend(html);
        console.log(data.key);
    })
}

function readPostbyVote() {
    var dataRef = firebase.database().ref("post").orderByChild("postVote");
    dataRef.once('value', function(data) {
        data.forEach(function(childData) {
            arr.push({
                "id": childData.key,
                "title": childData.val().postTitle,
                "img": childData.val().postImage,
                "vote": childData.val().postVote
            });
        });
        arr.reverse();
    });
    if (typeof arr[PostQuantity2] != 'undefined') {
        showPostbyVote(1);
        var myChart = new Chart(ctx, {
            type: 'horizontalBar',
            data: {
                labels: [arr[0].title, arr[1].title, arr[2].title, arr[3].title, arr[4].title], //放postTitle
                datasets: [{
                    backgroundColor: [
                        'rgba(238,77,77, 0.9)',
                        'rgba(242,103,92, 0.9)',
                        'rgba(245,155,134, 0.9)',
                        'rgba(247,194,150, 0.9)',
                        'rgba(255,239,164 ,0.9)',
                    ],
                    borderWidth: 0,
                    label: '票數',
                    data: [arr[0].vote, arr[1].vote, arr[2].vote, arr[3].vote, arr[4].vote, 0] //放postVote
                }]
            }
        });
    } else {
        setTimeout(function() {
            readPostbyVote();
        }, 50);
    }
}

function showPostbyVote(PageNum2) {
    CountPostQuantity2();
    $('.list').empty();
    var PostNum = PageNum2 * 9;
    PostNum = PostNum.toString();
    var i = PostNum - 9;
    if (PostNum > PostQuantity2) {
        PostNum = PostQuantity2;
    }
    for (i; PostNum > i; i++) {
        var html = createElement(arr[i].id, arr[i].title, arr[i].img, arr[i].vote);
        $('.list').append(html);
    }
}

function CountPostQuantity() {
    var dataRef = firebase.database().ref('post').orderByKey();
    dataRef.on('value', function(data) {
        $('.pageList').empty();
        PostQuantity1 = data.numChildren();
        PageNum1 = Math.ceil(PostQuantity1 / 9);
        var html2 = createPage(PageNum1);
        $('.pageList').append(html2);
    })
}

function CountPostQuantity2() {
    var dataRef = firebase.database().ref('post').orderByKey();
    dataRef.on('value', function(data) {
        $('.pageList').empty();
        PostQuantity2 = data.numChildren();
        PageNum2 = Math.ceil(PostQuantity2 / 9);
        var html2 = createPage2(PageNum2);
        $('.pageList').append(html2);
    })
}

function createPage(PageNum1) {
    var PageNum = PageNum1;
    var page = 1;
    var html2 = '';
    while (PageNum > 0) {
        var html2 = html2 + '<li>\
                <a onclick="readPost(' + page + ')">' + page + '</a>\
                </li>';
        PageNum = PageNum - 1;
        page = page + 1;
    }
    return html2;
}

function createPage2(PageNum2) {
    var PageNum = PageNum2;
    var page = 1;
    var html2 = '';
    while (PageNum > 0) {
        var html2 = html2 + '<li>\
                <a onclick="showPostbyVote(' + page + ')">' + page + '</a>\
                </li>';
        PageNum = PageNum - 1;
        page = page + 1;
    }
    return html2;
}

function createElement(postKey, postTitle, postImg, postVote) {
    var html = '<li>\
                    <a href="#" onclick="showInfo(' + postKey + ')">\
                        <div class="voteInfo">\
                            <img class="thumb" src="' + postImg + '" />\
                            <div class="detail">\
                                <p class="workName">' + postTitle + '</p>\
                            </div>\
                        </div>\
                    </a>\
                    <div class="voteNow">\
                        <a class="voteThis" href="#" onclick="voteThis(' + postKey + ')">我要投票</a>\
                        <span>總票數: ' + postVote + '</span>\
                    </div>\
                </li>';
    return html

}
var newImageFile, newNo;

function stripHTML(input) {
    if (input) {
        return input
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    } else {
        return input
    }
}

function showInfo(id) {
    var html;
    var detalRef = firebase.database().ref('post/' + id + '/');
    detalRef.on('value', function(data) {
        html = '<div>\
            <img src="' + data.val().postImage + '" width="100%">\
            <p id="workID">作品編號: ' + id + '</p>\
            <p id="workName">作品名稱: ' + data.val().postTitle + '</p>\
            <p>作品描述:</p>\
            <p id="workDicpt">' + data.val().postDecpt + '</p>\
            <a class="voteThis right enlarge" href="#" onclick="voteThis(' + id + ')">我要投票</a>\
        </div>'
    })
    swal({
        title: "",
        html: html,
        showConfirmButton: false,
        allowEscapeKey: false,
        width: 720,
        padding: 50
    })
}

function voteThis(id) {
    firebase.auth().onAuthStateChanged(function(user) {
        if (!user) {
            swal({
                title: "請先登入Facebook",
                type: 'info',
                html: '需要登入才能投票喔！',
                showConfirmButton: true,
                showCancelButton: true
            }).then(function() {
                loginPlease(id);
            });
        } else {
            currentUser = user.uid;
            currentUserName = user.displayName;
            firebase.database().ref('users/' + currentUser + '/userVoted').once('value').then(function(snapshot) {
                voted = snapshot.val();      
            })
        }
    });
    if(currentUser!=""){
    	setTimeout(voteCheck(id), 1000);
    }
}

function voteCheck(id) {
    if (currentUser != "") {
        if (voted == 0) {
            var text = '<p>確定要投 ' + id + ' 號一票？</p><p>Login as ' + currentUserName + '</>';
            swal({
                title: '投票',
                html: text,
                type: 'info',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: '確定要投',
                cancelButtonText: '我考慮一下'
            }).then(function() {
                firebase.database().ref('/post/' + id + '/postVote').transaction(function(currentCount) {
                    return currentCount + 1;
                });
                firebase.database().ref('/users/' + currentUser + '/userVoted').transaction(function(currentCount) {
                    return currentCount + 1;
                })
                swal(
                    '投票成功！',
                    '已經成功將神聖的一票投給 ' + id + ' 號了',
                )
            })
        } else {
            swal({
                title: "一人一票",
                html: "你已經投過票囉！",
                type: 'error'
            })
        }
    }
}

function newPost() {
    swal({
        showCancelButton: true,
        title: '上傳台灣美景圖',
        input: 'file',
        inputAttributes: {
            accept: 'image/*'
        }
    }).then(function(file) {
        var reader = new FileReader
        reader.onload = function(e) {
            var html = '<form action="#" enctype="multipart/form-data" >\
                    <div id="previewArea"><img id="preview" src="' + e.target.result + '" width="100%"/></div>\
                    <table class="newPost">\
                        <tr>\
                            <td>作品名稱</td>\
                            <td><input type="text" class="imagename" name="postTitle" id="postTitle"maxlength="10"></td>\
                        </tr>\
                        <tr>\
                            <td><textarea placeholder="作品描述..." rows="5"  name="postDecpt" class="decpt"></textarea></td>\
                        </tr>\
                    </table>\
                </form>';
            swal({
                title: "",
                html: html,
                showConfirmButton: true,
                showCancelButton: true,
                allowEscapeKey: false,
                width: 540,
                padding: 50,
                confirmButtonColor: '#3085d6',
                confirmButtonText: '投稿'
            }).then(function() {
                createPost();
                swal(
                    '投稿完畢',
                    'Thank you!'
                ).then(function() {
                    location.reload();

                });
            });

            newImageFile = dataURItoBlob(e.target.result);
        }
        reader.readAsDataURL(file);

    })
}

function dataURItoBlob(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], {
        type: mimeString
    });
}

function createPost() {
    var ref = firebase.database().ref();
    ref.once("value").then(function(snapshot) {
        newNo = snapshot.child('postNoRef').val();
        newNo = newNo + 1;
        firebase.database().ref('/postNoRef').transaction(function(currentCount) {
            return currentCount + 1;
        });
    });
    var title = $('#postTitle').val();
    var decpt = $('.decpt').val();
    decpt = stripHTML(decpt);
    var metadata = {
        contentType: 'image/jpg'
    };
    var uploadTask = firebase.storage().ref().child('postImg/' + newNo).put(newImageFile, metadata);
    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
        function(snapshot) {
            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            switch (snapshot.state) {
                case firebase.storage.TaskState.PAUSED:
                    break;
                case firebase.storage.TaskState.RUNNING:
                    break;
            }
        },
        function(error) {
            switch (error.code) {
                case 'storage/unauthorized':
                    // User doesn't have permission to access the object
                    break;
                case 'storage/canceled':
                    // User canceled the upload
                    break;
                case 'storage/unknown':
                    // Unknown error occurred, inspect error.serverResponse
                    break;
            }
        },
        function() {
            // Upload completed successfully, now we can get the download URL
            var downloadURL = uploadTask.snapshot.downloadURL;
            // A post entry.
            var postData = {
                postTitle: title,
                postDecpt: decpt,
                postImage: downloadURL,
                postUser: null,
                postVote: 0
            };

            var sets = {};
            sets['/post/' + newNo] = postData;
            firebase.database().ref().update(sets);
            newImageFile = null;
        });
}


function loginPlease(postId) {
    event.preventDefault();
    var provider = new firebase.auth.FacebookAuthProvider();
    firebase.auth().signInWithPopup(provider).then(function(result) {
        var token = result.credential.accessToken;
        var user = result.user;

        firebase.database().ref('users/' + user.uid + '/userVoted/').once("value", function(snapshot) {
            if (snapshot.val() == null) {
                var userData = {
                    userId: user.uid,
                    userName: user.displayName,
                    userVoted: 0
                };
                var updates = {};
                updates['/users/' + user.uid + '/'] = userData;
                firebase.database().ref().update(updates);
                swal({
                    type: 'info',
                    title: '登入成功',
                    showConfirmButton: true
                }).then(function() {
                    location.reload();
                });
            } else {
                voted = snapshot.val();
            }
        });

    }).catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        var email = error.email;
        var credential = error.credential;
        console.log(errorCode);
    });
}