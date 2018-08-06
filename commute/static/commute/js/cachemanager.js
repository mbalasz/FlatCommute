class CacheManager {
  constructor() {}

  getCachedDistances(flatId, placeIds) {
    return new Promise(function(resolve, reject) {
      $.ajax({
        url: "cache/distances",
        data: {
          'flatId': flatId,
          'placeIds': placeIds,
        },
        datatype: 'json',
        success: function(data) {
          resolve(data);
        },
        error: function(jqXHR, textStatus, errorThrown) {
          reject(errorThrown);
        }
      })
    });
  }

  cacheDistance(flatId, placeId, direction, commuteType) {
    var leg = direction.routes[0].legs[0];
    $.ajax({
        url: "cache/update/distances",
        data: {

        },
        data: {
          'flatId': flatId,
          'placeId': placeId,
          'commuteType': commuteType,
          'seconds': leg.duration.value,
        },
        datatype: 'json',
        success: function(data) {
          this.distancesBuffer = [];
        },
        error: function(jqXHR, textStatus, errorThrown) {
          console.log("Error caching distance for flat id " + flatId + " and placeId " + placeId, textStatus);
        }
      })
  }
}