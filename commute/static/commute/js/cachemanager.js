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

  cacheDistance(origin, destination, direction, commuteType) {
    var leg = direction.routes[0].legs[0];
    $.ajax({
        url: "cache/update/distance",
        data: {
          'origin': origin,
          'destination': destination,
          'commuteType': commuteType,
          'seconds': leg.duration.value,
        },
        datatype: 'json',
        success: function(data) {
          this.distancesBuffer = [];
        },
        error: function(jqXHR, textStatus, errorThrown) {
          console.log("Error caching distance for origin " + origin + " and destination " + destination, textStatus);
        }
      })
  }
}