<?php

namespace App\Http\Controllers\Api;

use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Api\BaseController;
use Illuminate\Http\Request;
use App\Models\Post;
// use App\Models\PostDraft;
// use App\Models\Label;
use App\Models\User;
use App\Models\Image;
use stdClass;
use DateTime;
use DateTimeZone;
use Carbon\Carbon;

// for delete images
function removeDirectory($path)
{

    $files = glob($path . '/*');
    foreach ($files as $file) {
        is_dir($file) ? removeDirectory($file) : unlink($file);
    }
    rmdir($path);

    return;
}

class PostController extends BaseController
{
    public function index(Request $request)
    {
        if ($request->has('tag')) {
            $query = Post::where('tag', $request['tag'])->orWhere('username', 'like', "%{$request['tag']}%")->orWhere('content', 'like', "%{$request['tag']}%");
        } else if ($request->has('user_id'))
            $query = Post::where('user_id', $request['user_id']);
        else if (!$request->has('number')) {
            if ($request->has('order')) {
                $posts = Post::orderBy($request['order'], $request['sequence'])->get();
            } else {
                $posts = Post::all();
            }
            return response()->json($posts, 200);
        } else {
            if ($request->has('order')) {
                $posts = Post::orderBy($request['order'], $request['sequence'])->take($request['number'])->get();
            } else {
                $posts = Post::all()->take($request['number']);
            }
            return response()->json($posts, 200);
        }
        if ($request->has('number'))
            $query = $query->limit($request['number']);
        if ($request->has('order')) {
            $query = $query->orderBy($request['order'], $request['sequence']);
        }
        $posts = $query->get();
        return response()->json($posts, 200);
    }

    public function show($post)
    {
        $post = Post::find($post);
        return response()->json($post, 200);
    }

    public function getPictureFromTag(Request $request)
    {
        if ($request->has('tag'))
            $posts = Post::where("tag", $request['tag'])->select("id", "url")->orderBy($request['order'], $request['sequence'])->limit($request['number'])->get();
        else
            $posts = Post::select("id", "url")->orderBy($request['order'], $request['sequence'])->limit($request['number'])->get();
        return response()->json(["imageListWithId" => $posts]);
    }

    public function getPictureFromUserId(Request $request)
    {
        if ($request->has('number'))
            $posts = Post::where('user_id', $request['user_id'])->select("id", "url")->limit($request['number'])->get();
        else
            $posts = Post::where('user_id', $request['user_id'])->select("id", "url")->get();
        return response()->json(["imageListWithId" => $posts]);
    }

    public function uploadImage(Request $request)
    {
        $image = new Image();
        $image->upload($request->file('imageupload'));
        $image->image_alt = "image";
        $image->save();
        return response()->json(['url' => $image->url['original'], 'id' => $image->id], 200);
    }

    public function deleteImage(Request $request)
    {
        $imageURL = dirname(substr($request['canceledURL'], 1), 2);
        removeDirectory($imageURL);
        return response()->json(['url' => $imageURL], 200);
    }

    public function uploadDesc(Request $request)
    {
        $post = new Post();
        $post->url = $request['url'];
        $post->user_id = intval($request['user_id']);
        $post->username = $request['username'];
        $post->content = $request['content'];
        $post->tag = $request['tag'];
        $post->save();
        return response()->json(['id' => $post->id], 200);
    }

    public function destroy($id, Request $request)
    {
        $post = Post::find($id);
        $post->delete();
        return $this->sendResponse($post, "success");
    }

    public function update($id, Request $request)
    {
        $post = Post::find($id);
        $post->content = $request['content'];
        $post->save();
        return $this->sendResponse($post, 'Post was successfully updated');
    }

    public function recover(Request $request)
    {
        $post = Post::withTrashed()->find($request['id']);
        $post->restore();
        return $this->sendResponse($post, 'Post was successfully restored');
    }

    public function adminAll(Request $request)
    {
        $query = Post::withTrashed();
        if ($request['id'] !== null) {
            $query = $query->where('id', 'like', "%{$request['id']}%");
        }
        if ($request['tag'] !== null) {
            $query = $query->where('tag', 'like', "%{$request['tag']}%");
        }
        if ($request['user_id'] !== null) {
            $query = $query->where('user_id', 'like', "%{$request['user_id']}%");
        }
        if ($request['content'] !== null) {
            $query = $query->where('content', 'like', "%{$request['content']}%");
        }
        if ($request['username'] !== null) {
            $query = $query->where('username', 'like', "%{$request['username']}%");
        }

        foreach (array('deleted_at', 'created_at', 'updated_at') as $col) {
            if ($request[$col][0] !== null && $request[$col][1] !== null) {
                $query = $query->whereBetween($col, array(gmdate('Y.m.d H:i:s', strtotime($request[$col][0])), gmdate('Y.m.d H:i:s', strtotime($request[$col][1]))));
            } else if ($request[$col][0] !== null && $request[$col][1] === null) {
                $query = $query->where($col, '>=', gmdate('Y.m.d H:i:s', strtotime($request[$col][0])));
            } else if ($request[$col][0] === null && $request[$col][1] !== null) {
                $query = $query->where($col, '<=', gmdate('Y.m.d H:i:s', strtotime($request[$col][1])));
            }
        }

        $size = $query->count();
        $posts['data'] = $query->skip(($request['page'] - 1) * $request['size'])->take($request['size'])->get();
        $posts['total'] = $size;
        return response()->json($posts);
    }

    public function getPostInfo()
    {
        $date = new DateTime(null, new DateTimeZone('America/New_York'));
        $res['t'] = $date;
        $ndate = new DateTime(null);
        $res['n'] = $ndate;
        $res['valid'] = Post::all()->count();
        $res['new'] = Post::where('created_at', '>=', Carbon::parse('-1 days'))->count();
        return response()->json($res);
    }

    public function getLatest()
    {
        $posts = Post::orderBy('updated_at', 'desc')->take(8)->get();
        return response()->json($posts);
    }
}
