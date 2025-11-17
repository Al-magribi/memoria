import React from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useGetSinglePostQuery } from "../../../service/post/ApiPost";
import PostCard from "./PostCard";
import { Alert, Spin } from "antd";

const SinglePost = () => {
  const [searchParams] = useSearchParams();
  const postId = searchParams.get("postId");

  const { data: post, error, isLoading } = useGetSinglePostQuery(postId);

  if (isLoading) {
    return <Spin tip='Loading post...' />;
  }

  if (error) {
    return (
      <Alert
        message='Error'
        description='Failed to load post.'
        type='error'
        showIcon
      />
    );
  }

  if (!post) {
    return <Alert message='Post not found' type='info' showIcon />;
  }

  return <PostCard post={post} />;
};

export default SinglePost;
