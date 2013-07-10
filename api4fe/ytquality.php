<?php
    error_reporting(0);

    $vid = preg_replace('/\W/i',"",$_GET['vid'].$_POST['vid']);

    if(empty($vid)) exit(json_encode(array('status'=>'miss vid','data'=>"")));

    $content = file_get_contents('http://www.youtube.com/watch?v='.$vid);

    preg_match("/fmt_list\"[^:]*:[^\"]*\"([^\"]+)/i",$content,$match);

    if(count($match) < 1){
        echo json_encode(array('status'=>'failure','data'=>""));
    }else{
        echo json_encode(array('status'=>'success','data'=>$match[1]));
    }