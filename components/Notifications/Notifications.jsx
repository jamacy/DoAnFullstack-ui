/* eslint-disable no-nested-ternary */
import React, { useEffect, Fragment } from 'react';
import { useMutation, useQuery, useSubscription } from 'react-apollo';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid';
import Popover from '../UI/Antd/Popover/Popover';
import Button from '../UI/Antd/Button/Button';
import HeaderWrapper from 'container/Layout/Header/Header.style';
import { BellFilled } from '@ant-design/icons';
import { GET_USER_NOTIFICATION, GET_USER_UNREAD_NOTIFICATION_NUMBER, GET_TOTAL_UNREAD_TRANSACTIONS } from 'apollo-graphql/query/query';
import { CHECK_NOTIFICATION, DELETE_ALL_NOTIFICATIONS, READ_NOTIFICATION, UPDATE_TOTAL_UNREAD_TRANSACTIONS } from 'apollo-graphql/mutation/mutation';
import { UNREAD_NOTIFICATION, NOTIFICATION_BELL, REALTIME_NOTIFICATION_TRANSACTION } from 'apollo-graphql/subscription/subscription';

const demoNotifications = [
  {
    id: 1,
    name: 'David Doe',
    notification:
      'A National Book Award Finalist An Edgar Award Finalist A California Book Award Gold Medal Winner',
  },
  {
    id: 2,
    name: 'Navis Doe',
    notification:
      'A National Book Award Finalist An Edgar Award Finalist A California Book Award Gold Medal Winner',
  },
  {
    id: 3,
    name: 'Emanual Doe',
    notification:
      'A National Book Award Finalist An Edgar Award Finalist A California Book Award Gold Medal Winner',
  },
  {
    id: 4,
    name: 'Dowain Doe',
    notification:
      'A National Book Award Finalist An Edgar Award Finalist A California Book Award Gold Medal Winner',
  },
];

export default function TopbarNotification({ id }) {
  const [visible, setVisibility] = React.useState(false);
  const [more, setMore] = React.useState(6);
  const [checkNotification] = useMutation(CHECK_NOTIFICATION, {
    refetchQueries: () => [
      {
        query: GET_USER_UNREAD_NOTIFICATION_NUMBER,
        variables: {
          id,
        },
      },
    ],
  });
  const [deleteAllNotifications] = useMutation(DELETE_ALL_NOTIFICATIONS, {
    refetchQueries: () => [
      {
        query: GET_USER_NOTIFICATION,
        variables: {
          id,
        },
      },
    ],
  });
  const [readNotification] = useMutation(READ_NOTIFICATION, {
    refetchQueries: () => [
      {
        query: GET_USER_NOTIFICATION,
        variables: {
          id,
        },
      },
    ],
  });
  const [updateTotalUnreadTransactions] = useMutation(UPDATE_TOTAL_UNREAD_TRANSACTIONS)
  useSubscription(REALTIME_NOTIFICATION_TRANSACTION,
    {
      variables: {
        userId: id,
      },
      onSubscriptionData: async ({ subscriptionData, client }) => {
        if(subscriptionData && subscriptionData.data && subscriptionData.data.realtimeNotificationTransaction) {
        const { TXID, transactionPrice } = subscriptionData.data.realtimeNotificationTransaction;
        toast.info(`You have just received $${transactionPrice}.00 total from ${TXID}`,
          {
            position: 'top-left',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
          try{
            await updateTotalUnreadTransactions();
          }
          catch(e){
            toast.error(e.message, {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }
      }
    }})
  const router = useRouter();
  // console.log(id);
  // console.log(id);
  // const { data: unreadNotification, loading, error } = useSubscription(UNREAD_NOTIFICATION, {
  //   variables: {
  //     channelId: id,
  //   },
  // });
  // const {
  //   data: bellData,
  //   loading: loadingBell,
  //   error: errorBell,
  // } = useSubscription(NOTIFICATION_BELL, {
  //   variables: {
  //     channelId: id,
  //   },
  //   // onSubscriptionData: ({ subscriptionData: { data: bellSubscriptionData } }) => {
  //   //   console.log(bellSubscriptionData);
  //   // },
  //   shouldResubscribe: true,
  // });
   useQuery(GET_TOTAL_UNREAD_TRANSACTIONS, {
    onCompleted: async (data) => {
      if(data 
        && data.getTotalUnreadTransactions
        && data.getTotalUnreadTransactions.uncheckTransactions
        && data.getTotalUnreadTransactions.uncheckTransactions.totalTransactions) {
        const {totalTransactions, totalPrice} = data.getTotalUnreadTransactions.uncheckTransactions
        if(totalTransactions > 0) {
        toast.info(`You had ${totalTransactions} transactions(s) in total $${totalPrice}.00 while you're away `,
        {
          position: 'top-left',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        try{
          await updateTotalUnreadTransactions()
        }
        catch(e){
          toast.error(e.message,{
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        }
      }
    }
        // try{
        //    await updateTotalUnreadTransactions();
        // }
        // catch (e) {
        //   console.log(e)
        // }
    }
  })
  const {
    subscribeToMore,
    data: notiData,
    loading: notiLoading,
    error: notiError,
  } = useQuery(GET_USER_NOTIFICATION, {
    variables: {
      id,
    },
  });
  const {
    subscribeToMore: subscribeToMoreUnreadNotification,
    data: unreadNotificationData,
    loading: unreadNotificationLoading,
    error: unreadNotificationError,
  } = useQuery(GET_USER_UNREAD_NOTIFICATION_NUMBER, {
    // fetchPolicy:"cache-and-network",
    variables: {
      id,
    },
  });
  // if (bellData) {
  //   console.log(bellData);
  //   toast.success(bellData.notificationBell.reviewTitle,
  //     {
  //       position: 'top-left',
  //       autoClose: 5000,
  //       hideProgressBar: false,
  //       closeOnClick: true,
  //       pauseOnHover: true,
  //       draggable: true,
  //       progress: undefined,
  //     });
  // }
  useEffect(() => {
      let unsubscribe;
      unsubscribe = subscribeToMore({
      document: NOTIFICATION_BELL,
      variables: { channelId: id },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const newFeedItem = subscriptionData.data.notificationBell;
        toast.info(newFeedItem.reviewTitle,
          {
            position: 'top-left',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        const newData = {
          ...prev, getUserNotification: [newFeedItem, ...prev.getUserNotification],
        };
        return newData;
      },
    })
    if (unsubscribe) return () => unsubscribe()
  }, []);
  useEffect(() => {
    let unsubscribe;
    unsubscribe = subscribeToMoreUnreadNotification({
      document: UNREAD_NOTIFICATION,
      variables: { channelId: id },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        // console.log(subscriptionData);
        // console.log(prev);
        // Nên log prev và subscriptionData ra để spread đúng
        const { unreadNotification } = subscriptionData.data.unreadNotification;
        const newData = {
          // ...prev,
          getUserUnreadNotification: {
            ...prev.getUserUnreadNotification,
            unreadNotification,
          },
        };
        // console.log('this is new');
        // console.log(newData);
        return newData;
      },
    });
    if (unsubscribe) return () => unsubscribe()
  }, []);
  function handleVisibleChange() {
    setVisibility(!visible);
    setMore(6);
    checkNotification({
      variables: {
        id,
      },
    });
  }
  function handleDeleteAllNotifications() {
    deleteAllNotifications({
      variables: {
        id,
      },
    });
  }
  function handleReadNotification(url) {
    // console.log(url);
    readNotification({
      variables: {
        query: url.slice(1),
      },
    });
    router.push(url);
  }
  const content = (
    <HeaderWrapper className="topbarNotification" style={{ zIndex: '999' }}>
      <div className="isoDropdownHeader">
        <h3>Notifications</h3>
      </div>
      <div className="isoDropdownBody">
        {/* {bellData && (
          <a className="isoDropdownListItem">
            <h5>{bellData.notificationBell.reviewTitle}</h5>
            <p>{bellData.notificationBell.reviewText}</p>
          </a>
        )} */}
        { notiData && notiData.getUserNotification.slice(0, more).map((noti) => (
          <Fragment key={uuidv4()}>
            <h4 style={{ color: 'red' }}>{noti.reviewTitle}</h4>
            <a
              role="button"
              tabIndex="-1"
              onKeyDown={() => { handleReadNotification(`/${noti.query}`); }} // Tat ca noti có link giống nhau dc marked
              onClick={() => { handleReadNotification(`/${noti.query}`); }}
              className="isoDropdownListItem"
              style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: noti.read ? 'white' : 'gray' }}
            >
              <img style={{ width: '60px', height: '60px' }} src={noti.reviewAuthorProfilePic} alt={noti.reviewAuthorProfilePic} />
              <hr />
              <p>
                <b>{noti.reviewAuthorName}</b>
                {' '}
                {`${noti.peopleReviewedQuantity - 1 >= 1 ? `and ${noti.peopleReviewedQuantity - 2} other people have` : 'has'}
              reviewed your hotel post`}
                {' '}
                <b>
                  {noti.reviewedHotelName}
                </b>
                :
                {' '}
                <br />
                {`${noti.reviewText && noti.reviewText.length > 30 ? `${noti.reviewText.slice(0, 30)}...read more...` : `${noti.reviewText}`}`}
              </p>
            </a>
          </Fragment>
        ))}
      </div>
      <Button onClick={() => { handleDeleteAllNotifications(); }}>Delete all notifications</Button>
      <a
        role="button"
        tabIndex="-1"
        onKeyDown={() => { setMore(more + 3); }}
        onClick={() => { setMore(more + 3); }}
        className="isoViewAllBtn"
      >
        View More
      </a>
    </HeaderWrapper>
  );
  return (
    <Popover
      content={content}
      trigger="click"
      visible={visible}
      onVisibleChange={handleVisibleChange}
      placement="bottomLeft"
      overlayStyle={{ position: 'fixed' }}
    >
      <div className="isoIconWrapper">
        <BellFilled />
        <span>
          {!unreadNotificationLoading && unreadNotificationData
        && unreadNotificationData.getUserUnreadNotification.unreadNotification
            ? (unreadNotificationData.getUserUnreadNotification.unreadNotification > 50 ? '50+'
              : unreadNotificationData.getUserUnreadNotification.unreadNotification)
            : 0}
        </span>
      </div>
    </Popover>
  );
}
