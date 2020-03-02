onPageLoad('questions#play', function() {

  // 問題文
  var gPhrase = new Array("I see","That makes sense","Good for you",
                        "May be/Probably","Are you kidding?");      
  var gKey = '';              // 入力した文字
  var gKeycode = '';          // 入力したキー
  var gMondai = "";           //問題の文字列を格納
  var gMondai_pointer=0;      //問題文の入力位置(何文字目か)
  var gWrong_cnt=0;           //間違ったキータイプの回数
  var gCorrect_cnt=0;         //正しいキータイプの回数
  var gTimeLimit,gTimeStart;  //制限時間用、開始時間用
  var gTid;                   //タイマー用(setinterval)
  var ele1 = document.getElementById("question");
  var ele2 = document.getElementById("japanese_translation");
  var ele3 = document.getElementById("remaining_time");
  var ele4 = document.getElementById("wrong_cnt");

  // escキー押下でリセット
  document.onkeydown = function(event2) {
    if ( (event2.key===27 || event2.which===27 ) && ( gCorrect_cnt!=0 || gWrong_cnt!=0 ) ) {
      var now = new Date();     // 現在時刻を取得する
      var dt = now.getTime() - gTimeStart;   // 経過時間計算(マイクロ秒で出てくる)
      clearTimeout(gTid);    // タイマー解除
      ShowResult(dt);    // 終了画面
      gTid = gTimeStart = gTimeLimit = undefined;
      gCorrect_cnt = gWrong_cnt = 0;
    }
  }

  document.onkeypress = function(event) {
    // 押したキーによって得られる文字を取得する
    if (event) {
      // スペースを押したらゲームスタート(ブラウザによっては、event.keyが取得できない場合があるみたい)
      // gTimeStart===undefined ゲームスタートしているかどうかを判断する
      if ( (event.key===32 || event.which===32 ) && gTimeStart===undefined) {
        // 引数に制限時間(秒)を入力。未指定時デフォルトは10秒
        TimeInit(400);
        // 
        // 問題文を表示する
        gameSet();
      } else {
        if (event.key) {
          gKey = event.key;
        } else if (event.which) {
          gKey = String.fromCharCode(event.which)
        }
        if ( gTid!=undefined ) { judge(); }
      }
    }
  }

  // ttに制限時間(秒)を入力。未指定時デフォルトは10秒
  function TimeInit(tt=10) {
    gTimeLimit = tt * 1000; // 秒をミリ秒に変換
    var dd = new Date();  // 開始時間取得
    gTimeStart = dd.getTime();   // ミリ秒に変換
    gTid = setInterval(function() { TimeDisplay() }, 1000);   // タイマーセット(1秒)
  }

  function TimeDisplay() {
    var now = new Date();     // 現在時刻を取得する
    var dt = now.getTime() - gTimeStart;   // 経過時間計算(マイクロ秒で出てくる)
    ele3.innerHTML = "残り" + Math.round( (gTimeLimit - dt) / 1000 ) + "秒";

    // 制限時間が終わったらやる処理
    if(dt > gTimeLimit) {    // ※3
      clearTimeout(gTid);    // タイマー解除
      ShowResult(dt);    // 終了画面
      gTid = gTimeStart = gTimeLimit = undefined;
      gCorrect_cnt = gWrong_cnt = 0;
    }
  }

  //タイピングゲームの問題をセットする関数
  function gameSet() {
    //問題文とカウント数をクリアする
    gMondai="";
    gMondai_pointer=0;
    
    //表示する問題文の作成
    gMondai = gPhrase[ Math.floor( Math.random() * gPhrase.length ) ];

    var str1 = '';
    for ( var i = 0 ; i < gMondai.length ; i++ ) {
      str1 += "<span id='word" + i + "'>" + gMondai.substr(i,1) +"</span>";
    }

    //問題枠に表示する
    $('i').remove();
    
    // デフォ表示を消す
    ele2.innerHTML = ele1.innerHTML = str1;
    // 問題が変わる度に表示が消されるのは変なので、最初に一度表示したら終わるまで表示したままにしておく
    if ( gWrong_cnt===0 && gCorrect_cnt===0 ) {
      ele4.innerHTML = ele3.innerHTML = "";
    }
    ele4.parentElement.style.display = "block";
  }

  // タイピング正誤判定
  function judge() {
    //入力されたキーコードと、問題文のキーコードを比較
    if (gKey === gMondai.substr(gMondai_pointer,1) || gKey === gMondai.substr(gMondai_pointer,1).toLowerCase() ) {
      gCorrect_cnt++;

      //入力されたセルの文字色を灰色にする
      var idName = "word"+gMondai_pointer;
      document.getElementById(idName).style.color="#dddddd";

      gMondai_pointer++; //カウント数を＋１にする
      
      //問題文を全部入力できかたどうか確認
      if ( gMondai.length === gMondai_pointer) {
        gameSet();
      }
    } else {
      gWrong_cnt++;
      ele4.innerHTML = "間違いタイプ回数" + gWrong_cnt + "回";
    }
  }

  //終了したらやること
  function ShowResult(dt) {
    ele4.innerHTML = ele3.innerHTML = ele2.innerHTML = "";
    ele4.parentElement.style.display = "none" ;
    ele1.innerHTML = '終了!!';
    var result = '<table><tr><td>間違えたキー数</td><td>' + gWrong_cnt + ' key</td></tr>';
    result += '<tr><td>正解キー数</td><td>' + gCorrect_cnt + ' key</td></tr>';
    result += '<tr><td>時間</td><td>' + Math.round(dt / 100) / 10 + ' s';
    result += '<tr><td>スピード</td><td>' + Math.round(gCorrect_cnt / dt * 10000) / 10 +' key/s</td></tr>';
    result += '</table>';
    ele2.innerHTML = result;
    ele3.innerHTML = 'スペースキーを押したら再スタート';
  }
});
