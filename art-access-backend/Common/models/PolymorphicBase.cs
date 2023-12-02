using System;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Common.models;

public interface IPolymorphicBase
{
    string type { get; }
}

public class PolymorphicBaseJsonConverter : JsonConverter
{

    static IEnumerable<Type>? _polymorphicTypes = null;
    public static IEnumerable<Type> GetPolymorphicTypes()
    {
        if (null == _polymorphicTypes)
        {
            var type = typeof(IPolymorphicBase);
            _polymorphicTypes = AppDomain.CurrentDomain.GetAssemblies()
                .SelectMany(s => s.GetTypes())
                .Where(p => type.IsAssignableFrom(p) && !p.IsGenericType);

        }
        return _polymorphicTypes;


    }

    public override bool CanWrite => false;
    public override bool CanRead => true;

    public override bool CanConvert(Type objectType)
    {
        var ret = typeof(IPolymorphicBase).IsAssignableFrom(objectType);
        return ret;
    }

    public override object? ReadJson(JsonReader reader, Type objectType, object? existingValue, JsonSerializer serializer)
    {
        var jObject = JObject.Load(reader);

        var targetType = objectType;

        var type = (string?)jObject[nameof(IPolymorphicBase.type)];

        if (!string.IsNullOrWhiteSpace(type))
        {
            targetType = GetPolymorphicTypes().Where(t => t.Name == type).FirstOrDefault();
        }
        else
        {
            //throw new Exception("failed to convert type");
            //todo: log 
        }

        if (null == targetType)
            targetType = objectType;

        var target = Activator.CreateInstance(targetType);

        if (null == target)
            throw new Exception($"failed to create target {targetType}");

        serializer.Populate(jObject.CreateReader(), target);


        return target;
    }

    public override void WriteJson(JsonWriter writer, object? value, JsonSerializer serializer)
    {
        throw new NotImplementedException();
    }
}

[JsonConverter(typeof(PolymorphicBaseJsonConverter))]
public abstract class PolymorphicBase<T> : IPolymorphicBase
{
    string _type = "";
    /// <summary>
    /// Used by front end to know what types to invoke
    /// </summary>
    [Required]
    public string type
    {
        get
        {
            if (!string.IsNullOrWhiteSpace(_type))
            {
                return _type;
            }
            else
            {
                var classType = this.GetType();
                if (classType == typeof(T))
                {
                    //throw new InvalidOperationException("class type should be derived");
                }
                return classType.Name;
            }
        }
        set
        {
            var classType = value;
            if (string.IsNullOrWhiteSpace(classType))
            {
                classType = this.GetType().Name;
            }
            if (classType == typeof(T).Name)
            {
                //throw new InvalidOperationException("class type should be derived");
            }
            _type = classType;
        }
    }



}

/*

public class PolymorphicConverter<T> : JsonConverter<T> where T : class
{
    public override T? ReadJson(JsonReader reader, Type objectType, T? existingValue, bool hasExistingValue, JsonSerializer serializer)
    {
        var t = reader.ReadAsString();
        if (null == t)
            return null;

        var h = JsonConvert.DeserializeObject(t) as T;

        return h;
    }


    public override void WriteJson(JsonWriter writer, T? value, JsonSerializer serializer)
    {
        var t = Newtonsoft.Json.JsonConvert.SerializeObject(value, new Newtonsoft.Json.JsonSerializerSettings
        {
            ContractResolver = new Newtonsoft.Json.Serialization.CamelCasePropertyNamesContractResolver(),
            Converters = new List<Newtonsoft.Json.JsonConverter>(new[] {
            new Newtonsoft.Json.Converters.StringEnumConverter()
            })
        });
        writer.WriteRawValue(t);
    }
}
*/

