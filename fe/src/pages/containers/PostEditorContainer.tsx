import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Prompt, RouteComponentProps } from 'react-router-dom';
import PostEditor from 'src/pages/presenters/PostEditor';
import { RootState } from 'src/redux';
import { postActions, UpdatePostPayload, WritePostPayload } from 'src/redux/modules/post';
import qs from 'query-string';
import { boardActions } from 'src/redux/modules/board';
import { parseToNumber } from 'src/lib/utils/typeUtils';
import { validatePostForm } from 'src/lib/utils/validationUtils';
import { REDIRECT_URL } from 'src/constants';
import { LocationFromState } from 'src/models';

interface MatchParams {
    boardId: string;
}

const PostEditorContainer = ({
    location,
    history,
}: RouteComponentProps<MatchParams, any, any | LocationFromState>) => {
    const dispatch = useDispatch();
    const { currentUser, currentPost, boards, subjects } = useSelector(
        (state: RootState) => ({
            currentUser: state.user.currentUser,
            currentPost: state.post.currentPost,
            boards: state.board.boards,
            subjects: state.board.subjects,
        })
    );
    const [blockOrNot, setBlockOrNot] = useState<boolean>(true);

    const query = qs.parse(location.search);
    const postId = parseToNumber(query.postId?.toString());
    let boardId = currentPost
        ? currentPost.board.id
        : parseToNumber(query.boardId?.toString());

    const onClickAdd = useCallback((payload: WritePostPayload) => {
        if (validatePostForm(payload.boardId, payload.title, payload.content)) {
            setBlockOrNot(false);
            dispatch(postActions.writePostAsync.request(payload));
        }
    }, []);

    const onClickEdit = useCallback(
        (payload: UpdatePostPayload) => {
            if (validatePostForm(payload.boardId, payload.title, payload.content)) {
                localStorage.setItem(
                    REDIRECT_URL,
                    `${location.state.from.pathname}${location.state.from.search}`
                );
                setBlockOrNot(false);
                dispatch(postActions.updatePostAsync.request(payload));
            }
        },
        [location]
    );

    const changeSubjects = useCallback((locBoardId: number) => {
        dispatch(boardActions.getSubjectsByBoardIdAsync.request(locBoardId));
    }, []);

    useEffect(() => {
        if (postId) {
            dispatch(postActions.readPostAsync.request(postId));
        }

        return () => {
            dispatch(postActions.initCurrentPost());
        };
    }, [postId]);

    if ((!postId && currentPost) || !currentUser || !boards) {
        return <div>?????? ???</div>;
    }

    if (currentPost && currentPost.createdBy !== currentUser.id) {
        alert('????????? ???????????????.');
        history.goBack();
        return <div></div>;
    }

    return (
        <>
            <PostEditor
                user={currentUser}
                currentPost={currentPost}
                boards={boards}
                boardId={boardId || boards[0].id}
                subjects={subjects}
                onClickAdd={onClickAdd}
                onClickEdit={onClickEdit}
                changeSubjects={changeSubjects}
            />
            <Prompt
                when={blockOrNot}
                message="?????? ?????????????????????? ?????? ?????? ????????? ?????? ???????????????."
            />
        </>
    );
};

export default PostEditorContainer;
